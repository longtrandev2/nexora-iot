# Development Roadmap — NEXORA IoT

Status: **v1.0.0-rc** (2026-10-05) — backend + database + MQTT bridge done on branch
`feat/backend-and-database`; only the physical-hardware run-through remains.

## Milestones

| Milestone | Scope | Status |
|---|---|---|
| FE (plan 260923-1440) | React dashboard, 5 pages, `IotApi` seam (mock adapter later removed) | Done |
| BE 01 — DB schema + base seed | `schema.sql`, `seed.sql`, schema-delta notes | Done |
| BE 02 — Spring Boot scaffold | config, entities, health, env-driven settings | Done |
| BE 03 — Auth + profile APIs | login/me/logout, profile (E-4), password (E-5), JWT | Done |
| BE 04 — Read APIs | sensors, latest, chart, sensor/device history search | Done |
| BE 05 — Device control + MQTT bridge | UC03 confirm loop, E1 504, E3 lock, STOMP `/topic/devices` | Done |
| BE 06 — Sensor ingestion | `sensor_data` → DB → `/topic/sensors` | Done |
| BE 07 — FE `HttpIotApi` adapter | REST + STOMP + polling fallback, Vite proxy | Done |
| BE 08 — Tests, docs, E2E | 36 JUnit tests, Postman, docs, FE on real backend only | Done except hardware E2E |

## Verified (2026-10-05, before the 10-06 simplification)
- 36/36 JUnit tests green on real MySQL 8.0 (Testcontainers; removed with the simplification).
- Live run with an authenticated Mosquitto broker + an ESP32 simulator that reproduces the
  firmware's parsing: control round-trip ~0.2–0.3 s, 504 timeout drill, E3 lock, overlapping
  commands, ingestion 3 rows / 2 s with `-1` kept, malformed payloads skipped, STOMP spoof rejected.
- Real Chrome run of the FE in `http` mode: login, live dashboard, LED toggle, histories,
  profile — no console or HTTP errors.

## Remaining before v1.0.0
- [x] Backend simplified; Hibernate creates the schema (no SQL scripts, no Docker).
- [x] Physical ESP32 + breadboard: ingestion and LED control confirmed (2026-10-06).
- [x] Config via `be/.env` (template `be/.env.example`); Swagger UI at `/swagger-ui.html`.
- [ ] Fill `be/.env` with the laptop's local MySQL password (root or a user allowed to create DBs).
- [ ] Full E2E with the physical ESP32 + breadboard (checklist in `runbook-demo.md`).
- [ ] Tag `v1.0.0` after the hardware run-through.

## Deliberately out of scope (YAGNI for a single-user laptop demo)
Login rate limiting, JWT revocation, data retention job, multi-user control queue.
See "Known Limits" in `db-schema-notes.md` for the trade-offs.
