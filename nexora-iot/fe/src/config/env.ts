/**
 * Runtime environment configuration for the backend connection (Spring Boot, see be/).
 * Both values have working defaults for `npm run dev` (Vite proxies /api and /ws).
 */
export const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const wsUrl: string = import.meta.env.VITE_WS_URL ?? ''
