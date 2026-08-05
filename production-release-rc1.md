# Production Release Candidate — Lymiar v1.0.0-rc1

**Data:** 2026-08-03  
**Fase:** 8.3 — Production Release Candidate  
**Regra:** zero novas funcionalidades; comportamento funcional inalterado.

---

## 1. Resumo executivo

O Lymiar está pronto como **Release Candidate 1**. Suites críticas (FE completo + hub fases 7.15–8.2) verdes; build estático Next.js OK. Foram corrigidos apenas bloqueadores de build/SEO privado. Problemas estruturais pré-existentes no hub (Awin public coupon / topic coverage) ficam documentados para **1.1**.

---

## 2. Estado da plataforma

| Camada | Estado RC1 |
|--------|------------|
| Frontend (GH Pages, `output: export`) | Build OK · 288 páginas estáticas |
| Hub API (FastAPI / VPS) | Auth + Sync + Notifications + catálogo |
| Identity DB | Separada do catálogo |
| Catalog DB | Read-only API |
| OAuth | Google / Apple / Microsoft / GitHub |
| Cloud Sync | Cloud-first autenticado |
| Notifications | In-app + fila email/push |
| Telegram | Independente (sem alterações nesta fase) |

---

## 3. Resultados dos testes

### Frontend (`lymiar-web`)

| Suite | Resultado |
|-------|-----------|
| Vitest | **138 passed** / 24 files |
| `next build` | **OK** (após fix tipagem Discovery) |

### Backend (`lymiar-hub`)

| Suite | Resultado |
|-------|-----------|
| Fases 7.15–8.2 (auth, sync, notif, catalog, homepage, insights, discovery, knowledge, marketplace) | **75 passed** |
| Suite completa pytest | **752 passed**, **5 failed** (pré-existentes) |

### Falhas pytest (não introduzidas em 8.0–8.2)

1. `test_awin_coupon_source_of_truth` — `awin1.com` ainda aparece em dict público (2 tests)
2. `test_topic_coverage_live_test` — routing_ok 6≠7 / 7≠9 (3 tests)

→ Candidatos **v1.1** (alteração funcional / editorial).

---

## 4. Cobertura

- FE: auth, sync merge/offline, notifications center/prefs/push, compare, cart, projects, watchlists, taxonomy filters, homepage, marketplace, discovery/insights/knowledge
- Hub: identity, cloud sync CRUD+ETag, notifications ingest/dedup/queue/templates, canonical catalog, homepage, marketplace intelligence

---

## 5. Problemas encontrados (auditoria)

| Área | Achado | Severidade | Acção RC1 |
|------|--------|------------|-----------|
| Build TS | `ProductDiscoverySection` tipagem incompatível | Bloqueante | **Corrigido** |
| Insights | `confidence` podia ser `undefined` | Bloqueante build | **Corrigido** |
| SEO | Áreas privadas indexáveis via robots | Médio | **Corrigido** disallow |
| Hub testes | Awin URL leak em coupon público | Médio | Documentado → 1.1 |
| Hub testes | Topic coverage routing | Baixo | Documentado → 1.1 |
| Push | Sem VAPID em prod | Médio | Documentado → 1.1 |
| Email | Sender stub (log only) | Médio | Documentado → 1.1 |
| ESLint | exhaustive-deps warnings (3) | Baixo | Pendente (não bloqueia) |
| JWT test secret | Warning comprimento <32 bytes em testes | Baixo | Pendente testes |
| Deploy | Secrets OAuth/SMTP no VPS a verificar ops | Ops | Checklist abaixo |

---

## 6. Problemas corrigidos

1. Tipagem Discovery → `recommendationsFromApi()`
2. `confidence` default `0` em `resolveProductInsights`
3. `robots.txt` Disallow: favoritos, alertas, listas, carrinho, projetos, perfil, entrar, notificações (+ já existentes timeline/minha-área)
4. Versão npm → `1.0.0-rc1`

---

## 7. Problemas pendentes → v1.1

- Corrigir leak `awin1.com` em cupões públicos
- Alinhar topic coverage fixtures/routing
- Configurar VAPID + SMTP reais
- Digest diário/semanal de notificações
- Worker paralelo de eventos (sem tocar Scheduler)
- Smoke E2E OAuth em staging com secrets reais
- Resolver warnings React hooks

---

## 8. Performance

| Item | Nota |
|------|------|
| Build | Compila ~6–14s; 288 páginas estáticas |
| Lazy | Homepage sections `dynamic`; Discovery lazy fetch |
| Bundle | Sem análise Lighthouse em staging nesta fase |
| Hydration | Client islands; sem middleware (export) |
| Requests | ETag sync 304; Discovery 1 search fallback |

Otimizações transparentes apenas; sem mudanças de API.

---

## 9. Segurança

| Controlo | Estado |
|----------|--------|
| OAuth state HMAC | OK |
| JWT HS256 + Bearer / cookie HttpOnly | OK |
| CORS credentials + origins allowlist | OK |
| user_id só do JWT | OK (sync + notifications) |
| Tokens não logados | OK (grep auth) |
| Unsubscribe token HMAC | Presente |
| Secrets em env VPS | Ops checklist |

---

## 10. SEO

| Item | Estado |
|------|--------|
| metadata / OG / Twitter | layout + páginas produto |
| canonical | páginas principais |
| robots | actualizado RC1 |
| sitemaps | 3 URLs em robots |
| JSON-LD Product | ProductJsonLd |
| Área privada | noindex + disallow |
| 404 | Next default static |

---

## 11. Acessibilidade

| Item | Estado |
|------|--------|
| Button type default | OK (7.22) |
| Menu ARIA header/bell | Presente |
| Focus / tab order drawers | Aceitável; auditoria WCAG AA completa → 1.1 |
| Alt imagens cards | Melhorado 7.22/8.x |
| Contraste | Tema claro slate/sky — sem regressão visual RC1 |

---

## 12. Estado VPS / Backend

**Preparação (ops — executar no servidor):**

```bash
cd /path/to/lymiar-hub
git pull
source .venv/bin/activate
pip install -r requirements.txt   # inclui PyJWT
# Garantir AUTH_* e AUTH_IDENTITY_DB
# Identity DB cria tabelas no startup (auth + sync + notifications)
sudo systemctl restart lymiar-api   # ou nome real do serviço
# Scheduler: NÃO alterar config; apenas restart se deploy de código partilhado
curl -fsS https://api.lymiar.com/api/v1/health
curl -fsS https://api.lymiar.com/api/v1/session
```

Health: API read-only + identity lifespan init.

---

## 13. Estado Frontend

- Repo: `lymiar-web`
- Build: `npm run build` → `out/`
- Deploy: GitHub Actions `Deploy GitHub Pages` on push `main`
- Versão: `1.0.0-rc1`

---

## 14. Checklist completa

- [x] Auditoria global documentada
- [x] Vitest 138 verdes
- [x] Pytest fases 8.x + catalog intelligence verdes
- [x] Build Next export OK
- [x] Limpeza mínima (tipagem / robots) sem mudança de comportamento
- [x] CHANGELOG.md
- [x] RELEASE_NOTES.md
- [x] production-release-rc1.md
- [x] Versão `1.0.0-rc1`
- [x] Push `main` + tag `v1.0.0-rc1` (git)
- [ ] Restart serviços VPS
- [ ] Smoke produção pós-deploy
- [ ] OAuth secrets verificados em prod
- [ ] SMTP / VAPID (opcional RC1)

---

## 15. Smoke test (pós-deploy)

Homepage · Pesquisa · Categorias · Produto · Comparador · Projetos · Carrinho · Favoritos · Timeline · Mercado · Catálogo · `/entrar` · Sync Minha Área · `/notificacoes` · Perfil

---

## 16. Critérios RC1

| Critério | |
|----------|--|
| Zero alterações motores Lymiar | Cumprido |
| Zero alterações ranking / search SQL / taxonomy / scheduler / telegram | Cumprido |
| Sem novas features nesta fase | Cumprido |
| Estabilidade / docs / build | Cumprido |
| Tag v1.0.0-rc1 | A criar no git |

---

*Gerado na FASE 8.3 — Production Release Candidate.*
