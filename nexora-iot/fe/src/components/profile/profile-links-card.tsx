import type { User } from '@/types/iot'

/** Fallback repo when the user has no github_url set (E-3 field). */
const DEFAULT_REPO = 'https://github.com/longtranddev2/nexora-iot'

interface LinkItem {
  icon: string
  label: string
  href: string | undefined
}

/** Liên kết dự án card: GitHub is real (E-3); the rest are static anchors. */
export function ProfileLinksCard({ user }: { user: User }) {
  const links: LinkItem[] = [
    { icon: 'code', label: 'GitHub Repository', href: user.github_url?.trim() || DEFAULT_REPO },
    { icon: 'design_services', label: 'Figma Design', href: undefined },
    { icon: 'api', label: 'Postman Workspace', href: undefined },
    { icon: 'description', label: 'Project Documentation', href: `${DEFAULT_REPO}/tree/main/docs` },
  ]
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-card-hover">
      <div className="mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">link</span>
        <h3 className="font-title-sm text-title-sm text-on-background">Liên kết dự án</h3>
      </div>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href ?? '#'}
              target={link.href ? '_blank' : undefined}
              rel="noreferrer"
              onClick={link.href ? undefined : (e) => e.preventDefault()}
              className="group flex items-center justify-between rounded-lg border border-outline-variant p-3 transition-all hover:border-primary hover:bg-surface-container-low"
            >
              <div className="flex items-center gap-3 text-on-surface-variant group-hover:text-primary">
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                <span className="font-body-md font-medium text-body-md">{link.label}</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary">open_in_new</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
