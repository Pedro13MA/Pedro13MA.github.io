# FASE 8.1 — Cloud Sync

## Objectivo

Sincronizar dados pessoais do utilizador autenticado (OAuth FASE 8.0).
Anónimo continua 100% localStorage. **Zero** alterações a motores Lymiar.

## Arquitectura

```
Browser
  ├─ anónimo → Local*Adapter (inalterado)
  └─ autenticado → SyncService → Cloud*Adapter → Hub /api/v1/user/*
                                              → lymiar_identity.db
                                              → user_id = JWT.sub
```

## Adapters activados

| Adapter | Domínio |
|---------|---------|
| `CloudFavoriteAdapter` / `CloudAdapter` | favorites + lists + alerts |
| `CloudAlertAdapter` | alias userspace |
| `CloudListsAdapter` | alias userspace |
| `CloudProjectAdapter` | projects + project_items |
| `CloudSmartCartAdapter` | smart_cart + cart_items |
| `CloudWatchAdapter` | watchlists |
| `CloudCompareAdapter` | compare_lists |

## Tabelas (identity DB)

`favorites`, `alerts`, `lists`, `list_items`, `projects`, `project_items`,
`smart_cart`, `cart_items`, `watchlists`, `compare_lists`, `preferences`,
`notification_targets`, `sync_meta`.

Nunca tocam no catálogo / preços.

## Sync Engine

- `SyncService` — login bootstrap, merge, syncNow, online flush
- `OperationQueue` — fila offline (sessionStorage)
- `SyncStatus` — idle | synced | syncing | offline | error | pending_merge
- `ConflictResolver` — lastModified; projetos merge por slot

## Merge (1ª vez)

Diálogo: Manter ambos (recomendado) · Substituir cloud · Ignorar locais.
Nunca apaga automaticamente.

## API

| Método | Path |
|--------|------|
| GET/POST | `/api/v1/user/{favorites\|alerts\|lists\|projects\|cart\|watchlists\|compare\|preferences\|userspace}` |
| DELETE | `/api/v1/user/{collection}/{id}` |
| GET | `/api/v1/user/sync/status` |
| POST | `/api/v1/user/sync/device` |

JWT obrigatório. `user_id` do body é ignorado — só `JWT.sub`.

ETag + `If-None-Match` → 304.

## UI

- Minha Área: cartão Sincronização + estado + «Sincronizar agora»
- Favoritos: ícone cloud
- Projetos / Carrinho: badge Cloud / Sincronizado
- Diálogo merge local

## Privacidade

Não sincroniza: pesquisas, cookies, analytics, cache, timeline temporária de sessão.

## Critérios

- Cloud-first autenticado · Local-first anónimo · Offline com fila
- Zero alterações ranking / search / taxonomy / scheduler / telegram / marketplace / discovery / insights / catalog

## Preparação 8.2

- `sync_meta.devices` e etags por coleção
- Preferências (tema, idioma, layout, homepage, categorias, comparador, templates, watch)
- Fila de ops pronta para sync multi-dispositivo fino

## Testes

Hub: `test_cloud_sync.py`, `test_sync_conflicts.py`, `test_merge_local_cloud.py`, `test_preferences.py`  
FE: `sync.test.tsx`, `merge.test.tsx`, `offline.test.tsx`, `login-sync.test.tsx`
