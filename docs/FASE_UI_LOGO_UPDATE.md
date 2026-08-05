# FASE UI — Atualização do logótipo Lymiar

| Campo | Valor |
|-------|-------|
| **Data** | 2026-08-04 |
| **Fonte** | `Desktop/lymiar-logotipo.png` (1200×1200) |
| **Asset canónico** | `/brand/lymiar-logotipo.png` |
| **Release FE** | `20260804-2138` (`/opt/lymiar/frontend/current`) |

---

## Inventário (antes → depois)

| Superfície | Antes | Depois |
|------------|-------|--------|
| Header | SVG inline `LymiarLogo` + texto “Lymiar” | PNG brand + tagline “Quando comprar” |
| Footer | SVG + texto “Lymiar” | PNG brand |
| Hero homepage | SVG + “LYMIAR” uppercase | PNG brand |
| Login `/entrar/` | só título | PNG brand acima do título |
| Favicon | `/favicon.svg` (L antigo) | `favicon.ico` + 16/32 PNG |
| Apple touch | — | `/apple-touch-icon.png` |
| PWA / Android | — | 192 + 512 + `site.webmanifest` |
| Open Graph | `/og-default.svg` | `/og-default.png` (1200×630) |
| JSON-LD Organization.logo | `/favicon.svg` | `/brand/lymiar-logotipo.png` |

---

## Assets gerados

Script: `scripts/generate_brand_icons.py`

```
public/brand/lymiar-logotipo.png
public/favicon.ico
public/favicon-16x16.png
public/favicon-32x32.png
public/apple-touch-icon.png
public/android-chrome-192x192.png
public/android-chrome-512x512.png
public/icons/android-chrome-192x192.png
public/icons/android-chrome-512x512.png
public/og-default.png
public/site.webmanifest
```

Regenerar:

```bash
python scripts/generate_brand_icons.py
```

---

## Código alterado

- `src/components/ui/LymiarLogo.tsx` — passa a `next/image` sobre o PNG
- `src/components/layout/SiteHeader.tsx` — header + footer
- `src/components/home/v2/HomeHero.tsx`
- `src/components/auth/EntrarPageClient.tsx`
- `src/app/layout.tsx` — icons, manifest, OG/Twitter
- `src/app/page.tsx` — OG + JSON-LD
- `src/app/categoria/[slug]/page.tsx` — OG

---

## Validação

- [x] Header mostra o novo logótipo
- [x] Footer mostra o novo logótipo
- [x] Separador do browser usa novo favicon (`/favicon.ico` 200)
- [x] `site.webmanifest` aponta para 192/512 (200)
- [x] `og:image` = `https://lymiar.com/og-default.png` (200)
- [x] Deploy produção release `20260804-2138`

---

## Deploy

```bash
npm run build
# sync out/ → VPS
sudo /opt/lymiar/scripts/deploy_frontend.sh deploy /path/to/out
```

**Estado: VALIDADO EM PRODUÇÃO.**
