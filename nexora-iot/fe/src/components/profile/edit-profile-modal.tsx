import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { useAuth } from '@/auth/auth-context'
import { useIotApi } from '@/services/iot-api-context'
import { isApiError } from '@/services/api-error'
import type { User } from '@/types/iot'

const FIELD_CLASSES =
  'w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-body-md text-on-background outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024 // 2MB

/** E-4 edit modal: upload avatar từ file + sửa MSV/bio/liên kết dự án. */
export function EditProfileModal({ user, onClose }: { user: User; onClose: () => void }) {
  const api = useIotApi()
  const { updateUser } = useAuth()
  const fileInput = useRef<HTMLInputElement>(null)
  const [fullname, setFullname] = useState(user.fullname)
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url)
  const [githubUrl, setGithubUrl] = useState(user.github_url)
  const [figmaUrl, setFigmaUrl] = useState(user.figma_url)
  const [postmanUrl, setPostmanUrl] = useState(user.postman_url)
  const [docsUrl, setDocsUrl] = useState(user.docs_url)
  const [bio, setBio] = useState(user.bio)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const initials = user.fullname
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0]?.toUpperCase())
    .join('')

  // Chọn file ảnh → đọc thành data URL (không qua URL text).
  const handleFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    event.target.value = '' // cho phép chọn lại cùng 1 file
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('File chọn vào không phải là ảnh')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError('Ảnh đại diện phải nhỏ hơn 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarUrl(String(reader.result))
      setError('')
    }
    reader.onerror = () => setError('Không đọc được file ảnh')
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (pending) return
    if (!fullname.trim() || !email.trim() || !username.trim()) {
      setError('Vui lòng điền đầy đủ họ tên, mã sinh viên và email')
      return
    }
    setPending(true)
    setError('')
    try {
      const updated = await api.updateProfile({
        fullname: fullname.trim(),
        username: username.trim(),
        email: email.trim(),
        avatar_url: avatarUrl.trim(),
        github_url: githubUrl.trim(),
        figma_url: figmaUrl.trim(),
        postman_url: postmanUrl.trim(),
        docs_url: docsUrl.trim(),
        bio,
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
        {/* Avatar upload (file, không paste URL) */}
        <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-outline-variant bg-surface-container-low">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Ảnh đại diện" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display-metrics text-[28px] text-primary">{initials}</span>
            )}
          </div>
          <div className="space-y-2">
            <p className="font-body-md text-body-md text-on-surface-variant">Ảnh đại diện (JPG/PNG, tối đa 2MB)</p>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-title-sm text-title-sm text-primary transition-colors hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[20px]">upload</span>
              Tải ảnh lên
            </button>
            {avatarUrl ? (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="block font-body-md text-body-md text-error hover:underline"
              >
                Xóa ảnh
              </button>
            ) : null}
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
        </div>

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
            <input id="edit-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={FIELD_CLASSES} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="edit-email">
            Email
          </label>
          <input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={FIELD_CLASSES} />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="edit-github">
              GitHub — link dự án (URL)
            </label>
            <input id="edit-github" type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className={FIELD_CLASSES} />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="edit-figma">
              Figma (URL)
            </label>
            <input id="edit-figma" type="text" value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} placeholder="https://figma.com/..." className={FIELD_CLASSES} />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="edit-postman">
              Postman (URL)
            </label>
            <input id="edit-postman" type="text" value={postmanUrl} onChange={(e) => setPostmanUrl(e.target.value)} placeholder="https://postman.com/..." className={FIELD_CLASSES} />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="edit-docs">
              Tài liệu dự án (URL)
            </label>
            <input id="edit-docs" type="text" value={docsUrl} onChange={(e) => setDocsUrl(e.target.value)} placeholder="https://..." className={FIELD_CLASSES} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="edit-bio">
            Giới thiệu
          </label>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className={`${FIELD_CLASSES} resize-none`}
          />
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
