import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/auth-context'
import { toast } from '@/components/ui/toast'
import { isApiError } from '@/services/api-error'

/**
 * Login per login.html: split layout (gradient branding left / form right).
 * Single field accepts username OR email; wrong creds → error toast
 * "Sai tên đăng nhập hoặc mật khẩu". Remember-me picks the token storage.
 */
export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  if (isAuthenticated) return <Navigate to={from} replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError('')
    try {
      await login(usernameOrEmail, password, remember)
      navigate(from, { replace: true })
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Không thể kết nối đến máy chủ'
      setError(message)
      toast(message, 'error')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-body-md text-on-background">
      <div className="flex h-auto max-h-[calc(100vh-2rem)] w-full max-w-[1200px] overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-card-hover lg:h-[700px]">
        {/* Left: branding */}
        <div className="hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-secondary-container p-12 lg:flex lg:relative">
          <div className="relative z-10 flex h-full max-w-md flex-col justify-center text-on-primary">
            <h1 className="mb-4 font-display-metrics text-display-metrics">NEXORA IoT</h1>
            <p className="mb-8 font-headline-md text-headline-md font-light opacity-90">Monitor. Control. Connect.</p>
            <div className="mb-8 h-1 w-16 bg-secondary-container" />
            <p className="font-body-lg leading-relaxed text-body-lg opacity-80">
              Hệ thống quản lý thông minh cho phòng của bạn. Giám sát 3 cảm biến và điều khiển 3 đèn LED với độ chính
              xác và bảo mật tối đa.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex w-full items-center justify-center bg-surface p-8 sm:p-12 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">NEXORA IoT</h1>
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Monitor. Control. Connect.</p>
            </div>

            <div className="mb-8">
              <h2 className="font-headline-lg text-headline-lg text-on-background">Đăng nhập</h2>
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Truy cập vào trung tâm điều khiển của bạn
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => void handleSubmit(e)}>
              <div>
                <label htmlFor="email" className="mb-2 block font-title-sm text-title-sm text-on-background">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    mail
                  </span>
                  <input
                    id="email"
                    type="text"
                    autoComplete="username"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="admin@nexora.iot"
                    className="w-full rounded-lg border border-outline-variant bg-surface py-3 pl-10 pr-4 font-body-lg text-body-lg text-on-background placeholder-on-surface-variant/50 transition-shadow focus:border-primary focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block font-title-sm text-title-sm text-on-background">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-outline-variant bg-surface py-3 pl-10 pr-10 font-body-lg text-body-lg text-on-background placeholder-on-surface-variant/50 transition-shadow focus:border-primary focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-outline-variant bg-surface accent-primary"
                  />
                  <span className="ml-2 font-body-md text-body-md text-on-surface-variant">Ghi nhớ đăng nhập</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="font-body-md font-semibold text-body-md text-primary transition-colors hover:text-primary-container"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {error ? (
                <p role="alert" className="flex items-center gap-2 font-body-md text-body-md text-error">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-gradient-to-r from-primary to-primary-container px-4 py-3 font-title-sm text-title-sm text-on-primary transition-all hover:shadow-card-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
