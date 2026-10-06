/// <reference types="vite/client" />

/** Typed Vite env vars (see src/config/env.ts). All optional — code defaults apply. */
interface ImportMetaEnv {
  /** REST base URL, default '/api/v1' (proxied to the backend by Vite in dev) */
  readonly VITE_API_BASE_URL?: string
  /** STOMP/WebSocket endpoint URL; empty = same-origin /ws */
  readonly VITE_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
