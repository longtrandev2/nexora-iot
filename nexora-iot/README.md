# NEXORA IoT

Hệ thống giám sát và điều khiển IoT cho phòng thí nghiệm (đồ án môn IoT, PTIT): 3 cảm biến (nhiệt độ, độ ẩm, ánh sáng) + 3 đèn LED, giao tiếp MQTT qua ESP32.

## Repository Layout

```
nexora-iot/
├── docs/    # Spec + design tokens
├── fe/      # Vite + React + TypeScript + Tailwind CSS 3.4 (dashboard web app)
├── be/      # (gated) Spring Boot 3 + MySQL + MQTT + WebSocket
└── plans/   # gitignored — agent-internal planning
```

## Frontend (fe/)

```bash
cd fe
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
```

Stack: Vite, React 19, TypeScript (strict), Tailwind CSS 3.4 (Stitch design tokens), react-router-dom, axios, recharts. UI tiếng Việt theo design Stitch. Data layer: `IotApi` interface với `MockIotApi` (default) / `HttpIotApi`.

## Docs

- `docs/bao-cao-iot-spec.md` — đặc tả hệ thống (source of truth cho API/DB)
- `docs/design-tokens.md` — design tokens trích từ Stitch reference
