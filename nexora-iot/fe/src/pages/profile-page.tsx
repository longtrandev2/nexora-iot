import { useState } from 'react'
import { useAuth } from '@/auth/auth-context'
import { ChangePasswordModal } from '@/components/profile/change-password-modal'
import { EditProfileModal } from '@/components/profile/edit-profile-modal'
import { ProfileInfoGrid } from '@/components/profile/profile-info-grid'
import { ProfileLinksCard } from '@/components/profile/profile-links-card'

/** Static bio (no description field in /auth/me — YAGNI decision). */
const BIO =
  'Sinh viên Học viện Công nghệ Bưu chính Viễn thông, phụ trách phát triển backend và tích hợp dữ liệu cảm biến cho hệ thống NEXORA IoT. Đam mê thiết kế kiến trúc hệ thống phân tán và tối ưu hóa luồng dữ liệu thời gian thực.'

/** Thông tin cá nhân (API-02 view + E-4 edit + E-5 password). */
export function ProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  if (!user) return null

  const initials = user.fullname
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0]?.toUpperCase())
    .join('')

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-full rounded-bl-3xl bg-gradient-to-br from-primary-container/10 to-transparent" />
        <div className="relative z-10 mx-auto max-w-5xl">
          {/* Header card: avatar + name + actions */}
          <div className="relative mb-8 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
            <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-primary to-primary-container" />
            <div className="flex flex-col items-start gap-8 md:flex-row">
              <div className="flex shrink-0 flex-col items-center gap-4">
                <div className="relative h-32 w-32 rounded-full border-4 border-surface bg-gradient-to-br from-primary to-primary-container p-1">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.fullname} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-surface font-display-metrics text-[32px] text-primary">
                      {initials}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Thay avatar"
                  onClick={() => setEditing(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform hover:scale-105"
                >
                  <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                </button>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/10 px-3 py-1 font-label-caps text-label-caps text-primary">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Hoạt động
                </span>
              </div>

              <div className="w-full flex-1">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row">
                  <div>
                    <h1 className="mb-1 font-headline-lg text-headline-lg text-on-background">{user.fullname}</h1>
                    <p className="font-title-sm text-title-sm text-primary">IoT Backend Developer • NEXORA Team</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-title-sm text-title-sm text-on-primary shadow-sm transition-colors hover:bg-primary/90"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                      Chỉnh sửa hồ sơ
                    </button>
                    <button
                      type="button"
                      onClick={() => setChangingPassword(true)}
                      className="flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 font-title-sm text-title-sm text-primary transition-colors hover:bg-surface-container-high"
                    >
                      <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>
                <ProfileInfoGrid user={user} />
              </div>
            </div>
          </div>

          {/* Bento: bio + links */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-card-hover lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_circle</span>
                <h3 className="font-title-sm text-title-sm text-on-background">Giới thiệu ngắn</h3>
              </div>
              <p className="font-body-lg leading-relaxed text-body-lg text-on-surface-variant">{BIO}</p>
            </div>
            <ProfileLinksCard user={user} />
          </div>
        </div>
      </div>

      {editing ? <EditProfileModal user={user} onClose={() => setEditing(false)} /> : null}
      {changingPassword ? <ChangePasswordModal onClose={() => setChangingPassword(false)} /> : null}
    </>
  )
}
