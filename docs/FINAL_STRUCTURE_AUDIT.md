# FINAL_STRUCTURE_AUDIT — Lymiar

**Data:** 2026-08-04  
**Objectivo:** o repositório e a VPS devem parecer desenhados como Lymiar desde o dia 1.

---

## Estrutura canónica (Hub)

```
/opt/lymiar/
├── config/.env
├── database/lymiar.db
├── logs/
├── deploy/                 # systemd + nginx
├── scripts/
├── storage/
├── workers/
├── src/
├── tests/
└── .venv/
```

Bootstrap: `sudo bash deploy/vps_bootstrap_layout.sh`

## Estrutura canónica (Web)

```
lymiar-web/
├── CNAME                   # lymiar.com
├── package.json            # name: lymiar-web
├── .github/workflows/deploy.yml
└── src/
```

Clone alvo: `git@github.com:Pedro13MA/lymiar-web.git`  
Clone alvo hub: `git@github.com:Pedro13MA/lymiar-hub.git`

---

## Auditoria `Limiar|limiar|LIMIAR` (repos locais)

| Ocorrência | Razão | Compatibilidade obrigatória? | Remover depois? |
|------------|-------|------------------------------|-----------------|
| *(nenhuma em `src/` FE/Hub)* | — | — | — |
| Nomes de pasta locais no disco do developer (`Pedro13MA.github.io`, `spotter-intelligence-hub`) | Pastas de trabalho / remote GitHub ainda não renomeados | Sim até rename no GitHub | Sim — rename manual Settings → Rename |
| Conta OS na VPS (se ainda se chamar `limiar`) | UID/home no servidor de produção | Sim até `usermod` | Sim — `usermod -l lymiar` + `groupmod` no cutover |
| Conteúdo histórico dentro de `lymiar.db` (textos de produtos merchant) | Dados de merchants, não branding Lymiar | N/A | Não tocar (tabelas intactas) |

**Código, docs canónicos, units, nginx snippet, env examples, CSS, storage keys, módulos Python:** sem `limiar` / `Limiar` / `LIMIAR`.

---

## Acções manuais restantes (fora do Git)

1. **GitHub rename**
   - `spotter-intelligence-hub` → `lymiar-hub`
   - `Pedro13MA.github.io` → `lymiar-web` (ou manter Pages no mesmo remote e só CNAME)
2. **VPS cutover (sudo, zero data loss)**
   ```bash
   # Se ainda existir /opt/limiar:
   sudo systemctl stop limiar limiar-api limiar-ean-worker 2>/dev/null || true
   sudo mv /opt/limiar /opt/lymiar
   # Conta OS:
   sudo usermod -l lymiar limiar
   sudo groupmod -n lymiar limiar
   sudo usermod -d /opt/lymiar -m lymiar 2>/dev/null || true
   # Layout + services:
   sudo bash /opt/lymiar/deploy/vps_bootstrap_layout.sh
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. **DNS / SSL** — `lymiar.com`, `www.lymiar.com`, `api.lymiar.com`
4. **OAuth** — redirect URLs para domínios Lymiar
5. **Telegram** — nome/descrição do bot e canal `@lymiar_deals`
6. **Commit + push** destes repos

---

## Veredito

O código nos dois workspaces está estruturado e nomeado como **Lymiar**.  
Não há scripts de migração/rebrand no tree.  
Não há redirects nginx de nomes antigos no snippet canónico.  
Não há variáveis `LIMIAR_*` no código.  
O único “conhecimento” de um nome antigo vive fora do repo (remote GitHub + possível conta OS na VPS até cutover).
