# NEXORA IoT — Design Tokens

Source: Stitch design exports (login / dashboard / device-control / sensor-history / onoff-history / profile).
Implemented in `fe/tailwind.config.ts` — this doc is the human-readable reference. Light theme only.

## Colors (full set)

| Token | Hex | Notes |
|---|---|---|
| `primary` | `#004ac6` | Brand blue, sidebar logo, active nav, toggles |
| `on-primary` | `#ffffff` | |
| `primary-container` | `#2563eb` | Gradient end for buttons |
| `on-primary-container` | `#eeefff` | |
| `on-primary-fixed` | `#00174b` | |
| `on-primary-fixed-variant` | `#003ea8` | |
| `primary-fixed` | `#dbe1ff` | |
| `primary-fixed-dim` | `#b4c5ff` | |
| `inverse-primary` | `#b4c5ff` | |
| `secondary` | `#00687a` | Teal — "Online" status, humidity accents |
| `on-secondary` | `#ffffff` | |
| `secondary-container` | `#57dffe` | Cyan — ON-state icon chips, gradient end |
| `on-secondary-container` | `#006172` | |
| `on-secondary-fixed` | `#001f26` | |
| `on-secondary-fixed-variant` | `#004e5c` | |
| `secondary-fixed` | `#acedff` | |
| `secondary-fixed-dim` | `#4cd7f6` | |
| `tertiary` | `#3e3fcc` | Indigo — light sensor accents |
| `on-tertiary` | `#ffffff` | |
| `tertiary-container` | `#585be6` | |
| `on-tertiary-container` | `#f1eeff` | |
| `on-tertiary-fixed` | `#07006c` | |
| `on-tertiary-fixed-variant` | `#2f2ebe` | |
| `tertiary-fixed` | `#e1e0ff` | |
| `tertiary-fixed-dim` | `#c0c1ff` | |
| `error` | `#ba1a1a` | Alerts, logout, temp accents, badges |
| `on-error` | `#ffffff` | |
| `error-container` | `#ffdad6` | |
| `on-error-container` | `#93000a` | |
| `background` | `#faf8ff` | App background |
| `on-background` | `#131b2e` | |
| `surface` | `#faf8ff` | Card/sidebar base |
| `on-surface` | `#131b2e` | |
| `surface-variant` | `#dae2fd` | |
| `on-surface-variant` | `#434655` | Secondary text |
| `surface-dim` | `#d2d9f4` | |
| `surface-bright` | `#faf8ff` | |
| `surface-container-lowest` | `#ffffff` | Card background (white) |
| `surface-container-low` | `#f2f3ff` | Inputs, chips |
| `surface-container` | `#eaedff` | |
| `surface-container-high` | `#e2e7ff` | Hover fills |
| `surface-container-highest` | `#dae2fd` | Sidebar background |
| `surface-tint` | `#0053db` | |
| `inverse-surface` | `#283044` | Chart tooltip bg |
| `inverse-on-surface` | `#eef0ff` | |
| `outline` | `#737686` | Off-state icons, axis labels |
| `outline-variant` | `#c3c6d7` | Borders, toggle track (off), scrollbar |

## Border Radius

| Token | Value |
|---|---|
| `DEFAULT` | `0.25rem` |
| `lg` | `0.5rem` (inputs, buttons, icon chips) |
| `xl` | `0.75rem` (cards, modals) |
| `full` | `9999px` (pills, avatars, toggles) |

## Spacing

| Token | Value | Usage |
|---|---|---|
| `base` | `4px` | Micro gaps |
| `stack-sm` | `8px` | Tight stacks |
| `stack-md` | `16px` | Medium stacks |
| `stack-lg` | `32px` | Section spacing |
| `gutter` | `16px` | Grid gap between cards |
| `container-padding` | `24px` | Page/card padding |
| `header-height` | `72px` | Fixed top header |
| `sidebar-width` | `280px` | Fixed left sidebar |

## Typography — Manrope (400 / 600 / 700, Google Fonts)

| Token | Size / Line | Weight | Notes |
|---|---|---|---|
| `display-metrics` | 48 / 56 | 700 | tracking `-0.02em` — big sensor numbers |
| `headline-lg` | 32 / 40 | 700 | tracking `-0.01em` — page titles |
| `headline-lg-mobile` | 24 / 32 | 700 | |
| `headline-md` | 24 / 32 | 600 | section titles |
| `title-sm` | 18 / 24 | 600 | card titles, nav items |
| `body-lg` | 16 / 24 | 400 | |
| `body-md` | 14 / 20 | 400 | default body |
| `label-caps` | 12 / 16 | 700 | tracking `0.05em`, UPPERCASE — badges, labels |

## Elevation & Gradients

- Shadow `card-hover`: `0px 4px 20px rgba(37, 99, 235, 0.08)` (card hover; hover on primary buttons uses alpha 0.2)
- Gradient primary: `from-primary to-primary-container` (buttons, login branding)
- Gradient secondary: `from-primary to-secondary-container` (login split panel)
- Login shell shadow: `0px 4px 20px rgba(37, 99, 235, 0.08)`, `rounded-xl`

## Icons — Material Symbols Outlined

- Google Fonts variable font (`wght,FILL@100..700,0..1`).
- Default: `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`.
- Filled variant: attribute `data-weight="fill"` → `'FILL' 1` (active LED bulb, brand hub icon).
- Common glyphs: `hub`, `dashboard`, `history`, `settings_remote`, `format_list_bulleted`, `person`, `logout`, `search`, `notifications`, `mail`, `lock`, `visibility_off`, `device_thermostat`, `humidity_percentage`, `light_mode`, `lightbulb`, `trending_up`, `trending_down`, `expand_more`.

## Layout Constants

- Fixed sidebar: `w-[280px] h-screen fixed left-0 top-0` (bg `surface-container-highest`, border-r `outline-variant`), custom 4px scrollbar.
- Fixed header: `h-header-height fixed top-0 right-0 w-[calc(100%-280px)]` (bg `surface/80`, `backdrop-blur-md`, border-b `outline-variant`).
- Main content: `ml-[280px] mt-[72px] p-container-padding max-w-[1600px] mx-auto pb-20`.
- Content grid: `grid grid-cols-1 lg:grid-cols-12 gap-gutter` (sensor cards row = `md:grid-cols-3`).
- Text selection: `selection:bg-primary-container selection:text-on-primary-container`.

## Component Patterns (from dashboard.html)

- Card: `bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding hover:shadow-card-hover`.
- Sensor status chip: `px-2 py-0.5 rounded-full bg-surface-container-low border border-outline-variant font-label-caps text-label-caps` + colored dot.
- Toggle: `sr-only` checkbox + `w-11 h-6 rounded-full` track (`toggle-label`) + `h-5 w-5` knob; checked → track `#004ac6`, knob translateX(100%). See `fe/src/styles/global.css`.
- Nav item (active): `text-primary bg-secondary-container/20 border-l-4 border-primary rounded-lg font-title-sm`.
- Scrollbar: 4px webkit thumb `#c3c6d7` on transparent track (`.custom-scrollbar`).
