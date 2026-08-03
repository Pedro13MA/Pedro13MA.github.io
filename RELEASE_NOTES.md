# Release Notes — Limiar v1.0.0-rc1

**Data:** 3 de Agosto de 2026  
**Tipo:** Release Candidate (não é GA)

## O que é o Limiar

O Limiar responde se vale a pena comprar agora, esperar, ou se ainda não há dados suficientes — com base em preços **observados**, sem previsões inventadas.

## O que inclui esta RC1

| Área | Estado |
|------|--------|
| Pesquisa & catálogo | Pronto |
| Página de produto | Pronto |
| Comparador | Pronto |
| Smart Cart & Projetos | Pronto |
| Favoritos / Timeline | Pronto (local + sync cloud se autenticado) |
| Mercado & Homepage | Pronto |
| Conta OAuth | Pronto (providers com secrets configurados) |
| Cloud Sync | Pronto |
| Notificações | Pronto (in-app; email/push com providers a configurar) |

## Como testar

1. Abrir https://pedro13ma.github.io/
2. Pesquisar um produto → veredicto + lojas + histórico
3. Entrar com OAuth → Minha Área → sync
4. Ativar notificações de teste em `/notificacoes/`

## Limitações conscientes

- Cobertura de lojas parcial — o produto admite “ainda não sabemos”
- Email/Push dependem de secrets VPS (SMTP / VAPID)
- Alguns testes legados do hub (Awin/topic coverage) falham — não bloqueiam API Limiar 8.x

## Próximo passo

`v1.0.0` GA após smoke em produção e resolução dos itens 1.1 listados no `production-release-rc1.md`.
