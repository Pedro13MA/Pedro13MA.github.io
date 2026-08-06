# FASE UI — Kit de marca Lymiar (leão + coroa)

| Campo | Valor |
|-------|-------|
| **Data** | 2026-08-06 |
| **Fonte** | `Desktop/LYMIAR/{1,2,3,4}.png` |
| **Script** | `scripts/generate_brand_icons.py` |

## Variantes

| Ficheiro | Origem | Uso |
|----------|--------|-----|
| `/brand/lymiar-logo-primary.png` | 1.png | Social, OG, `/entrar`, JSON-LD |
| `/brand/lymiar-logo-square.png` | 2.png | Perfil / apple-touch |
| `/brand/lymiar-logo-horizontal.png` | 3.png | Navbar / footer |
| `/brand/lymiar-mark.png` | 4.png | Favicon pequeno, PWA, notificação |
| `/brand/lymiar-logotipo.png` | alias → primary | Compat |

Masters originais (canvas completo) em `/brand/*-full.png` e kit em `/brand/src/`.

## Regenerar

```bash
py -3.12 scripts/generate_brand_icons.py
```

Requer o kit em `Desktop/LYMIAR` ou em `public/brand/src/`.
