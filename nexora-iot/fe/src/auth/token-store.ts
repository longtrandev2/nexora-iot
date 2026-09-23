/**
 * Token persistence: localStorage when "Ghi nhớ đăng nhập" is checked,
 * sessionStorage otherwise (dies with the tab). Mock + Http adapters and the
 * auth context all go through this module — never touch storage directly.
 */
const STORAGE_KEY = 'nexora.auth.token'

export function saveToken(token: string, remember: boolean): void {
  clearToken()
  const storage = remember ? window.localStorage : window.sessionStorage
  storage.setItem(STORAGE_KEY, token)
}

export function readToken(): string | null {
  return window.sessionStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(STORAGE_KEY)
}

export function clearToken(): void {
  window.sessionStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem(STORAGE_KEY)
}
