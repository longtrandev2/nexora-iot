/**
 * Sidebar navigation labels (exact Stitch labels, Vietnamese).
 * Single source for SideNavBar links.
 */
export interface NavItem {
  to: string
  icon: string
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    icon: 'dashboard',
    label: 'Tổng quan',
  },
  {
    to: '/sensor-history',
    icon: 'history',
    label: 'Lịch sử cảm biến',
  },
  // /devices (Điều khiển thiết bị) đã ẩn khỏi nav — tính năng đã có sẵn ở màn Tổng quan.
  {
    to: '/onoff-history',
    icon: 'format_list_bulleted',
    label: 'Lịch sử bật/tắt',
  },
  {
    to: '/profile',
    icon: 'person',
    label: 'Thông tin cá nhân',
  },
]
