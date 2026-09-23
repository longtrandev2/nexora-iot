/// <reference types="vite/client" />

/** Typed Vite env vars (see src/config/env.ts). All optional — code defaults apply. */
interface ImportMetaEnv {
  /** 'mock' (default) | 'http' — selects the IotApi adapter */
  readonly VITE_API_MODE?: 'mock' | 'http'
  /** REST base URL for the http adapter, e.g. '/api/v1' (phase 08) */
  readonly VITE_API_BASE_URL?: string
  /** STOMP/WebSocket endpoint URL (phase 08) */
  readonly VITE_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
