import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { useIotApi } from '@/services/iot-api-context'
import { isApiError } from '@/services/api-error'

const MIN_LENGTH = 6
const FIELD_CLASSES =
  'w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-body-md text-on-background outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary'

/** E-5 change-password modal: verifies old, enforces ≥6 chars + confirmation. */
export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const api = useIotApi()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (pending) return
    if (newPassword.length < MIN_LENGTH) {
      setError(`Mật khẩu mới phải có ít nhất ${MIN_LENGTH} ký tự`)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp')
      return
    }
    setPending(true)
    setError('')
    try {
      await api.changePassword(oldPassword, newPassword)
      toast('Đã đổi mật khẩu', 'success')
      onClose()
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Không thể đổi mật khẩu')
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      title="Đổi mật khẩu"
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
            form="change-password-form"
            disabled={pending}
            className="rounded-lg bg-primary px-5 py-2.5 font-title-sm text-title-sm text-on-primary shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </>
      }
    >
      <form id="change-password-form" className="space-y-5" onSubmit={(e) => void handleSubmit(e)}>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="old-password">
            Mật khẩu hiện tại
          </label>
          <input id="old-password" type="password" autoComplete="current-password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={FIELD_CLASSES} />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="new-password">
            Mật khẩu mới (tối thiểu {MIN_LENGTH} ký tự)
          </label>
          <input id="new-password" type="password" autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={FIELD_CLASSES} />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="confirm-password">
            Nhập lại mật khẩu mới
          </label>
          <input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={FIELD_CLASSES} />
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
