# FASE 7.9 — Favoritos, Listas e Alertas Inteligentes

**Incentiva o regresso do utilizador.** Tudo local (localStorage). Motor Lymiar, pesquisa, ranking, taxonomy e API **inalterados**.

## Arquitetura (pronta para FASE 8)

```text
UI (Hero / páginas)
    ↓
user-space service (favoritos, listas, alertas)
    ↓
StorageAdapter  ←── injectável
    ├─ LocalStorageAdapter   (activo)
    └─ CloudAdapter          (stub — FASE 8 + auth)
```

### Tipos

| Tipo | Função |
| --- | --- |
| `Favorite` | Snapshot do produto + `listIds` |
| `SavedList` | Listas (sistema «Favoritos» + custom) |
| `AlertRule` | Regra de alerta local |
| `NotificationTarget` | Canal futuro (email/push/telegram) |

Trocar o adapter (`setUserSpaceAdapter(new CloudAdapter())`) na FASE 8 **sem reescrever** drawers, modais ou páginas.

## Funcionalidades

| Feature | Comportamento |
| --- | --- |
| ♡ Favorito | Abre drawer «Adicionar a» (listas + nova lista) |
| 🔔 Alerta | Modal: preço / % / mín. histórico / loja / stock + lojas + estado |
| `/favoritos` | Grelha com sort preço/score/recentes/nome |
| `/listas` | CRUD listas |
| `/alertas` | Tabela editar/eliminar/activar |
| Menu **Minha Área** | Favoritos · Listas · Alertas |
| Snackbar | Confirmação + Undo |

## Persistência

- Chave: `lymiar.userspace.v1`
- Migra `lymiar.favorites.v1` (string[]) automaticamente
- Sem polling, sem requests extra

## Critérios

- [x] Favoritos persistentes
- [x] Listas multi
- [x] Drawer + modal responsivos
- [x] Páginas Favoritos / Alertas / Listas
- [x] CloudAdapter preparado
- [x] Zero alterações motor / API / ranking

## Ficheiros

- `src/lib/user-space/*`
- `src/components/user-space/*`
- `src/app/favoritos|listas|alertas/`
- `ProductHero.tsx` + `SiteHeader.tsx`
