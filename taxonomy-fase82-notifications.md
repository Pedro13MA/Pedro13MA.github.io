# FASE 8.2 — Notification Platform

## Objectivo

Camada de notificações factuais sobre Favoritos, Watchlists, Projetos e Smart Cart.
**Sem** IA, previsões ou alterações a motores Lymiar / Scheduler / Telegram.

## Arquitectura

```
Observação factual (ingest API / worker paralelo futuro)
  → NotificationEventBuilder
  → NotificationService (prefs + dedup 30min)
  → inbox (notifications) + NotificationQueue
  → Email (HTML Lymiar) · Web Push · Browser
```

Telegram permanece canal editorial independente.

## Serviços (Hub)

| Ficheiro | Papel |
|----------|--------|
| `notification_service.py` | Orquestração |
| `notification_event_builder.py` | Eventos factuais + ban copy preditiva |
| `notification_queue.py` | Entrega assíncrona |
| `notification_preferences.py` | Canais / scopes / quiet hours |
| `notification_templates.py` | Email HTML + push payload |
| `notification_dedup.py` | Dedup key + agrupamento ≥5 |

## Tabelas (identity DB)

`notifications`, `notification_events`, `notification_preferences`,
`notification_devices`, `notification_log`, `notification_queue`, `notification_dedup`.

## API

| Método | Path |
|--------|------|
| GET | `/api/v1/notifications` |
| GET | `/api/v1/notifications/unread` |
| POST | `/api/v1/notifications/read` |
| GET/POST | `/api/v1/notifications/preferences` |
| POST | `/api/v1/notifications/device` |
| POST | `/api/v1/notifications/test` |
| POST | `/api/v1/notifications/ingest` |

JWT obrigatório. `user_id` só do token.

## Frontend

- `/notificacoes/` — timeline Hoje/Ontem/Semana, filtros, pesquisa (`noindex`)
- `/notificacoes/preferencias/` — canais, âmbitos, frequência, quiet hours
- Header: sino + contador + dropdown
- Produto: modal «Receber notificações» (eventos factuais)
- SW: `public/sw-notifications.js`

## Anti-spam

- Dedup por `(user, kind, entity)` · cooldown 30 min
- Quiet hours atrasam email/push
- Agrupamento preparado (≥5 → 1 email)

## Critérios

- Zero alterações ranking / search / taxonomy / scheduler / telegram / marketplace / discovery / insights
- Só eventos observados
- Preparado para FASE 8.3 (digest diário/semanal, VAPID prod, worker paralelo)

## Testes

Hub: `test_notifications.py`, `test_notification_queue.py`, `test_notification_preferences.py`, `test_webpush.py`, `test_email_templates.py`  
FE: `notifications.test.tsx`, `notification-center.test.tsx`, `push.test.tsx`, `preferences.test.tsx`
