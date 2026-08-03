# Changelog — Limiar

## [1.0.0-rc1] — 2026-08-03

### Release Candidate

Primeira Release Candidate pública do Limiar (web + hub). Comportamento funcional consolidado das fases 7.x e 8.0–8.2.

### Added (histórico 7.x–8.2)

- Taxonomia v2, catálogo canónico, homepage intelligence, marketplace
- Product knowledge / insights / discovery (factuais)
- Comparador, Smart Cart, Projetos, Compatibility Engine
- Favoritos, alertas locais, watchlists & timeline
- OAuth-first (Google, Apple, Microsoft, GitHub) + sessão JWT
- Cloud Sync (FASE 8.1) com merge seguro e fila offline
- Notification Platform (FASE 8.2) — email / push / browser / in-app

### Fixed (RC1)

- TypeScript build: tipagem de `ProductDiscoverySection` / confidence insights
- `robots.txt`: disallow de áreas privadas (auth, sync, notificações)

### Known issues → 1.1

- 5 testes hub pré-existentes (Awin coupon public dict / topic coverage routing)
- Web Push requer VAPID em produção
- SMTP real ainda stub (fila + templates prontos)
- Digest diário/semanal de notificações (estrutura pronta)

### Not changed (garantias RC1)

Ranking, Search SQL, Taxonomy, Scheduler, Telegram, motores Insights/Discovery/Marketplace.
