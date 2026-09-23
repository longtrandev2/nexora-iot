import type { User } from '@/types/iot'

/** Static fields with no API backing (locked YAGNI decisions). */
const SCHOOL = 'Học viện Công nghệ Bưu chính Viễn thông'
const TEAM = 'NEXORA Team'

/** Info grid (profile.html): student code, school, email, project team. */
export function ProfileInfoGrid({ user }: { user: User }) {
  const items = [
    { icon: 'badge', label: 'Mã sinh viên', value: user.username },
    { icon: 'school', label: 'Trường học', value: SCHOOL },
    { icon: 'mail', label: 'Email', value: user.email },
    { icon: 'groups', label: 'Nhóm dự án', value: TEAM },
  ]
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="material-symbols-outlined text-outline">{item.icon}</span>
          <div className="min-w-0">
            <p className="font-label-caps text-label-caps text-on-surface-variant">{item.label}</p>
            <p className="truncate font-body-md font-medium text-on-background" title={item.value}>
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
