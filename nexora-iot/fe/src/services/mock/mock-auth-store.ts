import { ApiError } from '@/services/api-error'
import type { LoginResponse, ProfileUpdate, User } from '@/types/iot'

/**
 * In-memory auth state for the mock adapter. Single seeded user
 * admin / admin123 (email admin@nexora.iot) — no registration (locked decision).
 * Tokens are opaque strings; semantics mirror the stateless JWT backend.
 */
const SEED_USER: User = {
  user_id: 1,
  username: 'admin',
  email: 'admin@nexora.iot',
  fullname: 'Trần Khắc Long',
  avatar_url: '',
  github_url: 'https://github.com/longtranddev2',
}

const MIN_PASSWORD_LENGTH = 6

export class MockAuthStore {
  private user: User = { ...SEED_USER }
  private password: string = 'admin123'
  private validTokens = new Set<string>()

  login(usernameOrEmail: string, password: string): LoginResponse {
    const input = usernameOrEmail.trim().toLowerCase()
    const matches =
      (input === SEED_USER.username || input === SEED_USER.email.toLowerCase()) &&
      password === this.password
    if (!matches) throw new ApiError(401, 'Sai tên đăng nhập hoặc mật khẩu')
    const token = `mock-token-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
    this.validTokens.add(token)
    return { token, user: this.currentUser() }
  }

  /** API-02 semantics: 401 when token unknown/expired (mock tokens die on reload). */
  getUser(token: string): User {
    if (!this.validTokens.has(token)) throw new ApiError(401, 'Phiên đăng nhập đã hết hạn')
    return this.currentUser()
  }

  /** API-03: trivial success, FE clears the stored token. */
  logout(token: string): void {
    this.validTokens.delete(token)
  }

  updateProfile(patch: ProfileUpdate): User {
    this.user = {
      ...this.user,
      ...(patch.fullname !== undefined && patch.fullname.trim() !== '' ? { fullname: patch.fullname.trim() } : {}),
      ...(patch.email !== undefined && patch.email.trim() !== '' ? { email: patch.email.trim() } : {}),
      ...(patch.avatar_url !== undefined ? { avatar_url: patch.avatar_url.trim() } : {}),
      ...(patch.github_url !== undefined ? { github_url: patch.github_url.trim() } : {}),
    }
    return this.currentUser()
  }

  changePassword(oldPassword: string, newPassword: string): void {
    if (oldPassword !== this.password) throw new ApiError(400, 'Mật khẩu hiện tại không đúng')
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new ApiError(400, `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`)
    }
    this.password = newPassword
  }

  private currentUser(): User {
    return { ...this.user }
  }
}
