import { useState } from 'react'

// Temporary design-token smoke test (phase 01) — replaced by real app shell in phase 02.
const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Tổng quan', active: true },
  { icon: 'history', label: 'Lịch sử cảm biến', active: false },
  { icon: 'settings_remote', label: 'Điều khiển thiết bị', active: false },
  { icon: 'format_list_bulleted', label: 'Lịch sử bật/tắt', active: false },
  { icon: 'person', label: 'Thông tin cá nhân', active: false },
]

function Sidebar() {
  return (
    <nav className="w-sidebar-width h-screen fixed left-0 top-0 z-20 flex flex-col border-r border-outline-variant bg-surface-container-highest py-stack-lg overflow-y-auto custom-scrollbar">
      <div className="mb-stack-lg flex items-center gap-3 px-container-padding">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
          <span className="material-symbols-outlined" data-weight="fill">
            hub
          </span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md text-primary">NEXORA IoT</h1>
          <p className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
            Hệ thống giám sát
          </p>
        </div>
      </div>
      <ul className="flex flex-1 flex-col space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className={`flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 font-title-sm text-title-sm transition-colors ${
                item.active
                  ? 'border-primary bg-secondary-container/20 text-primary'
                  : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-auto px-3 pt-stack-sm">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-3 rounded-lg px-4 py-3 font-title-sm text-title-sm text-error transition-colors hover:bg-error-container/50"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Đăng xuất</span>
        </a>
      </div>
    </nav>
  )
}

function Header() {
  return (
    <header className="fixed top-0 right-0 z-10 flex h-header-height w-[calc(100%-280px)] items-center justify-between border-b border-outline-variant bg-surface/80 px-container-padding backdrop-blur-md">
      <div className="font-title-sm text-title-sm text-on-surface-variant">
        Kiểm tra design tokens — Manrope / Material Symbols
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary">
        <span className="material-symbols-outlined">notifications</span>
      </div>
    </header>
  )
}

function SensorCard(props: {
  title: string
  value: string
  unit: string
  icon: string
  tone: 'error' | 'primary' | 'tertiary'
  trend: string
  trendUp: boolean
}) {
  const toneClass = {
    error: 'bg-error-container/30 text-error',
    primary: 'bg-primary-container/20 text-primary',
    tertiary: 'bg-tertiary-container/20 text-tertiary',
  }[props.tone]

  return (
    <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-container-padding transition-shadow hover:shadow-card-hover">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClass}`}>
          <span className="material-symbols-outlined">{props.icon}</span>
        </div>
        <div>
          <h3 className="font-title-sm text-title-sm text-on-surface">{props.title}</h3>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-low px-2 py-0.5 font-label-caps text-label-caps text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-secondary" /> Bình thường
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="font-display-metrics text-display-metrics text-on-background">
          {props.value} <span className="text-2xl font-normal text-on-surface-variant">{props.unit}</span>
        </span>
        <span
          className={`flex items-center gap-1 rounded-md px-2 py-1 font-label-caps text-label-caps ${
            props.trendUp ? 'bg-error-container/50 text-error' : 'bg-secondary-container/50 text-secondary'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {props.trendUp ? 'trending_up' : 'trending_down'}
          </span>
          {props.trend}
        </span>
      </div>
    </div>
  )
}

function LedCard() {
  const [on, setOn] = useState(true)
  return (
    <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-container-padding transition-shadow hover:shadow-card-hover">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg border transition-colors ${
            on
              ? 'border-secondary-container bg-secondary-container/20 text-secondary'
              : 'border-outline-variant bg-surface-container-high text-outline'
          }`}
        >
          <span className="material-symbols-outlined" data-weight={on ? 'fill' : undefined}>
            lightbulb
          </span>
        </div>
        <div>
          <h4 className="mb-1 font-title-sm text-title-sm text-on-surface">LED 1</h4>
          <span className="inline-flex items-center gap-1 font-label-caps text-label-caps text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Online
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={on}
            onChange={(e) => setOn(e.target.checked)}
            className="toggle-checkbox sr-only peer"
          />
          <div className="toggle-label relative h-6 w-11 rounded-full bg-outline-variant transition-colors peer-focus:ring-2 peer-focus:ring-primary/30">
            <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full border border-outline bg-white transition-transform" />
          </div>
        </label>
        <span className={`font-label-caps text-label-caps ${on ? 'text-primary' : 'text-outline-variant'}`}>
          {on ? 'BẬT' : 'TẮT'}
        </span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-background font-body-md text-on-background selection:bg-primary-container selection:text-on-primary-container">
      <Sidebar />
      <Header />
      <main className="mx-auto ml-[280px] mt-[72px] max-w-[1600px] p-container-padding pb-20">
        <div className="mb-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-background">Tổng quan</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Kiểm tra design tokens: màu, font, bo góc, khoảng cách, icon, toggle.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          <SensorCard title="Nhiệt độ" value="26.7" unit="°C" icon="device_thermostat" tone="error" trend="+3.1%" trendUp />
          <SensorCard title="Độ ẩm" value="61.4" unit="%" icon="humidity_percentage" tone="primary" trend="-4.4%" trendUp={false} />
          <SensorCard title="Ánh sáng" value="45" unit="%" icon="light_mode" tone="tertiary" trend="+8.6%" trendUp />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-gutter md:grid-cols-3">
          <LedCard />
          <div className="flex items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest p-container-padding">
            <button
              type="button"
              className="rounded-lg bg-gradient-to-r from-primary to-primary-container px-4 py-3 font-title-sm text-title-sm text-on-primary transition-all hover:shadow-card-hover active:scale-[0.98]"
            >
              Nút gradient primary
            </button>
          </div>
          <div className="flex flex-col justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-container-padding">
            <span className="font-headline-md text-headline-md text-on-background">Headline md 24/32</span>
            <span className="font-body-md text-body-md text-on-surface-variant">Body md 14/20</span>
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Label caps 12/16</span>
          </div>
        </div>
      </main>
    </div>
  )
}
