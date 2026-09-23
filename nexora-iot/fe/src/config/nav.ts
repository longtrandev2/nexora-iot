/**
 * Sidebar navigation + page subtitles (exact Stitch labels, Vietnamese).
 * Single source for SideNavBar links and TopNavBar title resolution.
 */
export interface NavItem {
  to: string
  icon: string
  label: string
  subtitle: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    icon: 'dashboard',
    label: 'Tổng quan',
    subtitle: 'Theo dõi dữ liệu cảm biến và trạng thái thiết bị theo thời gian thực.',
  },
  {
    to: '/sensor-history',
    icon: 'history',
    label: 'Lịch sử cảm biến',
    subtitle: 'Tra cứu dữ liệu cảm biến theo thời gian.',
  },
  {
    to: '/devices',
    icon: 'settings_remote',
    label: 'Điều khiển thiết bị',
    subtitle: 'Quản lý trạng thái ba đèn LED trong hệ thống.',
  },
  {
    to: '/onoff-history',
    icon: 'format_list_bulleted',
    label: 'Lịch sử bật/tắt',
    subtitle: 'Theo dõi các lần thay đổi trạng thái của đèn LED.',
  },
  {
    to: '/profile',
    icon: 'person',
    label: 'Thông tin cá nhân',
    subtitle: 'Quản lý thông tin tài khoản của bạn.',
  },
]

/** Resolve the nav entry for a pathname ('/' needs exact match). */
export function findNavItem(pathname: string): NavItem {
  return NAV_ITEMS.find((item) => (item.to === '/' ? pathname === '/' : pathname.startsWith(item.to))) ?? NAV_ITEMS[0]
}
