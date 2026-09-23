import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { useAuth } from '@/auth/auth-context'
import { useIotApi } from '@/services/iot-api-context'
import { isApiError } from '@/services/api-error'
import type { User } from '@/types/iot'

const FIELD_CLASSES =
  'w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-body-md text-on-background outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60'

/** E-4 edit modal: only API-backed fields are editable (others disabled). */
export function EditProfileModal({ user, onClose }: { user: User; onClose: () => void }) {
  const api = useIotApi()
  const { updateUser } = useAuth()
  const [fullname, setFullname] = useState(user.fullname)
  const [email, setEmail] = useState(user.email)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url)
  const [githubUrl, setGithubUrl] = useState(user.github_url)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (pending) return
    if (!fullname.trim() || !email.trim()) {
      setError('Vui lòng điền đầy đủ họ tên và email')
      return
    }
    setPending(true)
    setError('')
    try {
      const updated = await api.updateProfile({
        fullname: fullname.trim(),
        email: email.trim(),
        avatar_url: avatarUrl.trim(),
        github_url: githubUrl.trim(),
      })
      updateUser(updated)
      toast('Đã lưu thay đổi', 'success')
      onClose()
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Không thể lưu thay đổi')
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      title="Chỉnh sửa hồ sơ"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant px-5 py-2.5 font-title-sm text-title-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            disabled={pending}
            className="rounded-lg bg-primary px-5 py-2.5 font-title-sm text-title-sm text-on-primary shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </>
      }
    >
      <form id="edit-profile-form" className="space-y-5" onSubmit={(e) => void handleSubmit(e)}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="edit-fullname">
              Họ và tên
            </label>
            <input id="edit-fullname" type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} className={FIELD_CLASSES} />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="edit-username">
              Mã sinh viên
            </label>
            <input id="edit-username" type="text" value={user.username} disabled className={FIELD_CLASSES} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="edit-email">
            Email
          </label>
          <input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={FIELD_CLASSES} />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="edit-avatar">
            Ảnh đại diện (URL)
          </label>
          <input id="edit-avatar" type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className={FIELD_CLASSES} />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="edit-github">
            GitHub (URL)
          </label>
          <input id="edit-github" type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className={FIELD_CLASSES} />
        </div>
        {error ? (
          <p role="alert" className="flex items-center gap-2 font-body-md text-body-md text-error">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  )
}
