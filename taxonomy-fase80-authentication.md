# FASE 8.0 — Identity Platform (OAuth First)

## Objectivo

Introduzir identidade de utilizador no Limiar: login OAuth, sessão JWT, perfil.
**Não** sincronização, **não** cloud storage, **não** conta com password.

## Arquitectura

```
Browser (GH Pages, static export)
  └─ AuthProvider / SessionProvider (Auth.js-aligned)
       ├─ /entrar → botões OAuth
       ├─ UserMenu (Entrar | avatar)
       └─ Bearer JWT (sessionStorage) + credentials include
              │
              ▼
Hub FastAPI (identidade isolada)
  ├─ SQLite limiar_identity.db  (NÃO é o DB de preços)
  ├─ OAuth: Google · Apple · Microsoft · GitHub
  ├─ JWT HS256 cookie `limiar_session` + Bearer
  └─ GET /me · GET /session · POST /logout · GET /auth/{provider}
```

### Porque o Hub e não Route Handlers NextAuth

O frontend publica com `output: "export"` (GitHub Pages). Auth.js (NextAuth v5)
precisa de Route Handlers `/api/auth/*` — incompatível com export estático.

Decisão:
- **Auth.js v5** (`next-auth@beta`) define providers, estratégia JWT e página `/entrar`
  em `src/auth.config.ts`.
- **Runtime OAuth + JWT** corre no Hub (`src/auth/`), independente do motor Limiar.
- O frontend SessionProvider espelha o contrato Auth.js (`status`, `signIn`, `signOut`).

## Fluxo OAuth

1. Utilizador em `/entrar/` clica «Continuar com Google» (etc.).
2. Redirect → `GET {API}/api/v1/auth/{provider}?callbackUrl=…`
3. Hub redirecciona para o IdP (state HMAC assinado).
4. IdP → `GET|POST {API}/api/v1/auth/{provider}/callback`
5. Hub troca `code` → perfil, upsert `users`, emite JWT.
6. Set-Cookie `limiar_session` (HttpOnly, Secure, SameSite=None) + redirect
   para `/entrar/callback/?token=…` (Bearer para cross-origin GH Pages ↔ API).
7. FE guarda token e chama `GET /api/v1/session`.

## Modelo User (mínimo)

| Campo | Notas |
|-------|--------|
| id | UUID |
| provider | google \| apple \| microsoft \| github |
| providerAccountId | id no IdP |
| name, email, image | do IdP |
| createdAt, lastLogin | ISO UTC |

Sem morada, telefone, preferências, linking multi-provider.

## Endpoints

| Método | Path | Auth |
|--------|------|------|
| GET | `/api/v1/me` | JWT → 401 se anónimo |
| GET | `/api/v1/session` | público (`authenticated` bool) |
| POST | `/api/v1/logout` | limpa cookie |
| GET | `/api/v1/auth/providers` | lista |
| GET | `/api/v1/auth/{provider}` | inicia OAuth |
| GET/POST | `/api/v1/auth/{provider}/callback` | callback IdP |

## Páginas FE

| Path | Conteúdo |
|------|----------|
| `/entrar/` | 4 botões OAuth |
| `/entrar/callback/` | consome token |
| `/perfil/` | foto, nome, email, provider, adesão, logout |

## Header

- Anónimo: **Entrar**
- Autenticado: avatar → Minha Área, Favoritos, Projetos, Carrinho, Alertas, Timeline, Perfil, Terminar sessão

## Protecção

Exigem login (redirect `/entrar/`): Favoritos, Alertas, Projetos, Carrinho, Timeline, Listas, Perfil.

Minha Área: guest vê vantagens + CTA Entrar; autenticado vê dashboard.

Públicas: home, pesquisa, produto, categoria, mercado, comparador, catálogo.

## Segurança

- Sem passwords / reset / email verification.
- State OAuth HMAC + TTL 10 min.
- Callback URLs allowlisted (`API_CORS_ORIGINS`).
- JWT secret via `AUTH_JWT_SECRET`.
- Cookie HttpOnly; Bearer em sessionStorage para SPA cross-origin.
- CORS `allow_credentials=True` só para origins conhecidos.
- Identity DB separado do catálogo.

## Variáveis de ambiente (Hub)

`AUTH_JWT_SECRET`, `AUTH_STATE_SECRET`, `AUTH_PUBLIC_API_BASE`,
`AUTH_GOOGLE_CLIENT_*`, `AUTH_APPLE_*`, `AUTH_MICROSOFT_*`, `AUTH_GITHUB_*`,
`AUTH_IDENTITY_DB`, `AUTH_COOKIE_SECURE`, `AUTH_DEFAULT_CALLBACK_URL`.

## Compatibilidade

- localStorage (favoritos, alertas, cart, projetos, watchlists) **inalterado**.
- Zero sync / merge / cloud adapters activos.
- Zero alterações a ranking, Search SQL, Scheduler, Telegram, Insights, Discovery, Marketplace, Taxonomy.

## Limitações (FASE 8.0)

- Sem sync multi-dispositivo.
- Sem OAuth account linking.
- Providers só activos com client id/secret configurados.
- Apple client_secret pode ser JWT `.p8` ou secret pré-gerado.

## Preparação FASE 8.1

- `user.id` estável para associar dados cloud.
- Session JWT pronto para Authorization em Cloud*Adapters.
- Endpoints `/me` / `/session` estáveis.
- localStorage continua até migração explícita (merge opt-in).

## Testes

- Hub: `tests/test_auth_identity.py` (providers, JWT, session, logout, OAuth mock).
- FE: `src/components/auth/__tests__/auth.test.tsx`.
