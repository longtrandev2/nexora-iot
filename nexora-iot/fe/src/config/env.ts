/**
 * Runtime environment configuration (single source of truth for adapter switch).
 * VITE_API_MODE defaults to 'mock'; 'http' activates HttpIotApi in phase 08.
 */
export type ApiMode = 'mock' | 'http'

export const apiMode: ApiMode = import.meta.env.VITE_API_MODE === 'http' ? 'http' : 'mock'

export const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const wsUrl: string = import.meta.env.VITE_WS_URL ?? ''
