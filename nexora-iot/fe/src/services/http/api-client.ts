import axios, { type AxiosError } from 'axios'
import { clearToken, readToken } from '@/auth/token-store'
import { apiBaseUrl } from '@/config/env'
import { ApiError } from '@/services/api-error'

/**
 * Shared axios instance for HttpIotApi:
 *  - adds `Authorization: Bearer <token>` from token-store
 *  - turns every failure into ApiError(status, BE `error` message) for the pages' error handling
 *  - 401 on an authenticated call → drop token + go to /login (session expired)
 * Timeout > BE device-confirm timeout (30s) so a 504 from the BE always arrives.
 */
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 40_000,
})

apiClient.interceptors.request.use((config) => {
  const token = readToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    const status = error.response?.status ?? 0
    const message =
      error.response?.data?.error ?? (status === 0 ? 'Không thể kết nối đến máy chủ' : `Lỗi máy chủ (${status})`)
    if (status === 401 && readToken() !== null) {
      clearToken()
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(new ApiError(status, message))
  },
)
