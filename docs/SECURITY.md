# SECURITY.md — Lymiar

# Objetivo

Definir as regras permanentes de segurança e privacidade operacional do Lymiar: segredos, autenticação administrativa, superfície de API, logs, contactos e dependências.

Serve para que qualquer alteração de código, deploy ou ops não comprometa credenciais, privilégios ou dados de utilizador.

# Âmbito

## O que cobre

- Segredos, tokens e credenciais (Git, env, logs, health).
- Admin e falha fechada (fail-closed).
- Superfície pública: GET read-only, validação de input.
- Logs, redaction e mínimo de identificadores.
- Contactos e finalidade (alerta / conta).
- Dependências de produção e release.
- Rate limiting e auth de utilizador web — só como regras de quando entram (roadmap), não como stack inventada.
- Relação com disclosure afiliado e tracking URLs (higiene, não marketing).

## O que não cobre

- Privacy policy legal completa (texto jurídico); este doc exige alinhamento com o comportamento real.
- Escolha de vault, IdP, WAF ou produto concreto de secrets.
- Desenho detalhado de OAuth / sessões web (Fase 5 / P2 em `ROADMAP_V2`).
- Segurança física do VPS ou compliance formal (ISO, SOC2).
- Regras estatísticas ou ConsumerDecision (ver docs de dados / decisão).

# Princípios

1. Compromisso de credenciais ou privilégios anula qualquer outra qualidade técnica.
2. Segredos fora do Git. Tokens fora dos logs. Sem excepção por conveniência de debug.
3. Admin fail-closed: sem configuração explícita de admins, zero privilégios.
4. Superfície pública de leitura não escreve estado.
5. Recolher o mínimo de dados pessoais; só com finalidade clara (alerta ou conta).
6. Segurança e privacidade prevalecem sobre conveniência de debug e atalhos de deploy (`ENGINEERING_PRINCIPLES`).
7. Evolution over Revolution: rotação e limpeza de secrets não se “reverte”; caminhos novos de auth entram com flag e rollback onde aplicável.
8. Tecnologia de segurança extra (Redis rate-limit, IdP complexo) só com trigger medido ou requisito de fase — nunca por moda.

# Regras

## Segredos e credenciais

1. Segredos nunca estão no controlo de versões (código, `.env` tracked, dumps, fixtures).
2. Segredos de produção vivem em env / mecanismo de secrets do ambiente — não em ficheiros commitados.
3. Tokens nunca aparecem em logs (incluindo URLs com `accessToken`, query strings, headers).
4. Health, métricas e erros públicos não expõem paths absolutos sensíveis, connection strings nem credenciais.
5. Após exposição conhecida ou suspeita: rotação imediata; não “reverter” a rotação.
6. Scanning de secrets no repositório (ex. GitHub secret scanning) deve ficar limpo; histórico contaminado exige purge/rotação conforme política ops.
7. Segredos de acesso à base seguem as mesmas regras (ver também `DATABASE_RULES`).

## Admin e privilégios

8. Admin fail-closed: sem lista de IDs/admins configurada, **zero** privilégios admin.
9. É proibido fail-open (“se a lista estiver vazia, todos são admin” ou equivalente).
10. Endpoints e comandos admin exigem autenticação/autorização explícita; ausência de config = deny.
11. Teste obrigatório: admin sem IDs configurados → deny.

## Superfície de API e escrita

12. Handlers GET de leitura **não escrevem** estado na base nem em side-effects persistentes.
13. Escrita só em métodos/contratos que a admitem (POST/PUT/PATCH/DELETE ou jobs internos).
14. Input externo validado nos boundaries públicos (tipos, tamanhos, formatos).
15. Sem XSS / injection óbvios no surface tocado (checklist de merge).
16. Rate limit básico na API pública: entra quando houver abuso observado ou spike de RPS; preferir reverse proxy (ex. nginx) antes de Redis (`ROADMAP_V2` 3.5).
17. Auth de utilizador web: só quando necessário a alertas/watchlist ricos (Fase 5 / item 3.6); não inventar auth “por ter”.

## Privacidade e contactos

18. Contactos (email, Telegram, etc.) só com finalidade de alerta ou conta; sem essa finalidade, não recolher.
19. É proibido mostrar sucesso de alerta sem registo persistido.
20. É proibido recolher contacto sem criar o alerta (ou a conta) correspondente.
21. Todo alerta criado é listável e cancelável pelo utilizador no mesmo canal.
22. Privacy policy descreve o que o produto faz de facto — não o pitch.
23. IDs de utilizador em logs só no mínimo necessário e **nunca** junto com tokens.
24. Telemetria não expoe conselho de compra misturado com receita/afiliado de forma que viole a separação de contextos (`QUALITY_BAR`).

## Afiliados e URLs (higiene)

25. Disclosure de comissão afiliada permanece obrigatório (ver `NON_NEGOTIABLES`); não é opcional por “segurança”.
26. URLs de tracking de rede não são o texto principal do link mostrado ao utilizador.
27. Não logar URLs de afiliado completas com tokens embutidos.

## Dependências e release

28. Dependências de produção têm versão fixada no release.
29. Alterações que tocam auth, secrets, admin ou handlers sensíveis passam `QUALITY_BAR` secções Segurança, Privacidade e Logs.
30. Suite / checks P0 de segurança aplicáveis verdes antes de merge a `main` (regra 58–60 de `NON_NEGOTIABLES`).

## Ops e incidente

31. Credenciais rodadas após commit acidental ou leak em log: tratar como comprometidas.
32. Documentação operacional de rotação/localização de secrets (ex. `docs/SECRETS.md` quando existir) **não** contém valores secretos — só procedimento.
33. Deploy não reintroduz ficheiros `.env` ou dumps com secrets no tree.

# Exemplos

## Corretos

- Token Telegram / Awin só em env do VPS; `.env*` no `.gitignore`; tree limpo no `gh secret scanning`.
- Log de erro Awin: host + status + request id — sem query com `accessToken`.
- Lista de admin vazia ou ausente → qualquer pedido admin devolve deny/403.
- GET `/product/...` só lê; monitoring/watch actualiza-se noutro caminho explícito.
- Formulário de alerta: contacto aceite só se o alerta ficar persistido e cancelável no mesmo canal.
- Rate limit no nginx quando crawl dispara RPS — sem Redis “porque é standard”.

## Incorretos

- `.env.vps.production` com token commitado.
- `logger.info(full_awin_url)` com token na query.
- Admin fail-open quando `ADMIN_IDS` está vazio.
- GET que faz upsert de monitoring “para aquecer cache”.
- Mostrar “alerta criado” sem row na BD.
- Recolher email “para novidades” sem entrega/alerta/conta.
- Fixar dependência de produção com range aberto (`*`) no release.

# Anti-padrões

- Segredos no Git “só temporariamente” ou “só na branch”.
- Tokens em logs “só em DEBUG” deixados ligados em produção.
- Admin fail-open para “facilitar o primeiro setup”.
- Expor path absoluto da BD, connection string ou env dump em `/health`.
- Auth de utilizador web sem necessidade de alertas/watchlist (stack por antecipação).
- Redis/WAF/IdP enterprise no dia 1 sem abuso ou requisito de fase.
- Privacy policy que descreve features que o produto ainda não faz.
- Misturar IDs de utilizador com tokens no mesmo evento de log.
- Tratar rotação de secret como reversível (voltar ao token antigo).

# Relação com outros documentos

| Documento | Relação |
|-----------|---------|
| `NON_NEGOTIABLES` | Regras 33–44, 40, 58–60. Prevalece. |
| `ENGINEERING_PRINCIPLES` | Princípio 17; ordem de prevalência #2 (segurança/privacidade). |
| `ARCHITECTURE_PRINCIPLES` | Segredos fora de código/logs; GET read-only; integrações. |
| `DATABASE_RULES` | Segredos de acesso à BD; GET não escreve. |
| `QUALITY_BAR` | Checklist merge: Segurança, Privacidade, Logs. |
| `ROADMAP_V2` | Fase 1.1 secrets/admin; 3.5 rate limit; 3.6 / Fase 5 auth web. |
| `PRODUCT_PRINCIPLES` / `VISION` | Honestidade e confiança do comprador; não reabre atalhos de segurança. |
| `README` / `GOVERNANCE` | Índice e processo. |

Em conflito: `NON_NEGOTIABLES` > `ENGINEERING_PRINCIPLES` / `ARCHITECTURE_PRINCIPLES` > este documento se divergir — na prática este documento **especializa** segurança/privacidade já fixadas; não as enfraquece.

Runbooks operacionais (`docs/SECRETS.md`, etc.) detalham *como* rodar/onde está o env; **não** alteram estas regras.

# Glossário

| Termo | Definição |
|-------|-----------|
| **Segredo** | Credencial ou material que concede acesso (token, password, API key, connection string com password). |
| **Fail-closed** | Sem configuração válida de autorização → negar acesso (não conceder). |
| **Fail-open** | Sem configuração → permitir acesso (proibido para admin). |
| **Redaction** | Remover ou mascarar tokens/PII antes de logar ou expor. |
| **Finalidade** | Motivo explícito e entregue para recolher um contacto (alerta ou conta). |
| **Superfície pública** | Endpoints e UI acessíveis sem privilégio admin. |
| **Rotação** | Invalidar credencial antiga e emitir nova após risco ou cadência. |
| **PII** | Dados que identificam ou localizam uma pessoa (contacto, IDs ligáveis). |

# Histórico

| Data | Nota |
|------|------|
| 2026-08-03 | Documento canónico criado. Consolida `NON_NEGOTIABLES` (37–44 e alertas 33–35), `ENGINEERING_PRINCIPLES` §17, `ARCHITECTURE_PRINCIPLES`, `QUALITY_BAR` §7–9, `DATABASE_RULES` (segredos BD / GET) e `ROADMAP_V2` 1.1 / 3.5 / 3.6. Sem novas funcionalidades nem stack inventada. |
