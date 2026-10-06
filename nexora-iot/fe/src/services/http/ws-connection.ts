import { Client, type StompSubscription } from '@stomp/stompjs'
import { wsUrl } from '@/config/env'

type Listener = (payload: unknown) => void

/** No WS within this window → polling fallback kicks in (spec UC02). */
const FALLBACK_GRACE_MS = 5_000

/** Explicit VITE_WS_URL, else same-origin /ws (Vite dev proxy forwards it to Spring Boot). */
function resolveWsUrl(): string {
  if (wsUrl) return wsUrl
  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${scheme}://${window.location.host}/ws`
}

/**
 * One lazy STOMP connection shared by all realtime subscriptions. Auto-reconnects every 5s
 * and re-subscribes every topic that still has listeners after each (re)connect.
 */
export class StompHub {
  private client: Client | null = null
  private readonly listeners = new Map<string, Set<Listener>>()
  private readonly subscriptions = new Map<string, StompSubscription>()

  get connected(): boolean {
    return this.client?.connected ?? false
  }

  subscribe(topic: string, listener: Listener): () => void {
    const set = this.listeners.get(topic) ?? new Set<Listener>()
    set.add(listener)
    this.listeners.set(topic, set)
    this.ensureClient()
    if (this.connected && !this.subscriptions.has(topic)) this.attach(topic)
    return () => {
      set.delete(listener)
      // Guard: a stale (repeated) unsubscribe must not tear down a newer listener set.
      if (set.size === 0 && this.listeners.get(topic) === set) {
        this.listeners.delete(topic)
        this.subscriptions.get(topic)?.unsubscribe()
        this.subscriptions.delete(topic)
      }
    }
  }

  private ensureClient(): void {
    if (this.client) return
    this.client = new Client({
      brokerURL: resolveWsUrl(),
      reconnectDelay: 5_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      debug: () => {},
      onConnect: () => {
        this.subscriptions.clear()
        for (const topic of this.listeners.keys()) this.attach(topic)
      },
      onWebSocketClose: () => this.subscriptions.clear(),
      onStompError: (frame) => console.warn('[ws] STOMP error', frame.headers.message),
    })
    this.client.activate()
  }

  private attach(topic: string): void {
    const sub = this.client!.subscribe(topic, (message) => {
      let payload: unknown
      try {
        payload = JSON.parse(message.body)
      } catch {
        console.warn('[ws] non-JSON message on', topic)
        return
      }
      this.listeners.get(topic)?.forEach((cb) => cb(payload))
    })
    this.subscriptions.set(topic, sub)
  }
}

/**
 * Realtime subscription with polling fallback: STOMP push when connected; otherwise (after a
 * 5s grace period) `poll` runs every `intervalMs`. Only one source is active at a time.
 * When the socket (re)connects, one catch-up poll fills the gap of pushes missed while offline.
 */
export function subscribeWithFallback<T>(
  hub: StompHub,
  topic: string,
  cb: (payload: T) => void,
  poll: () => Promise<T | null>,
  intervalMs: number,
): () => void {
  const unsubscribe = hub.subscribe(topic, (payload) => cb(payload as T))
  const startedAt = Date.now()
  let inFlight = false
  let wasConnected = false
  const runPoll = (onlyWhileDisconnected: boolean): void => {
    inFlight = true
    poll()
      .then((value) => {
        if (value !== null && !(onlyWhileDisconnected && hub.connected)) cb(value)
      })
      .catch(() => {}) // BE down: keep trying silently; pages already show their own errors
      .finally(() => {
        inFlight = false
      })
  }
  const timer = window.setInterval(() => {
    if (inFlight) return // re-evaluate on the next tick so a reconnect is never missed
    const connected = hub.connected
    const reconnected = connected && !wasConnected && Date.now() - startedAt >= FALLBACK_GRACE_MS
    wasConnected = connected
    if (reconnected) runPoll(false)
    else if (!connected && Date.now() - startedAt >= FALLBACK_GRACE_MS) runPoll(true)
  }, intervalMs)
  return () => {
    window.clearInterval(timer)
    unsubscribe()
  }
}
