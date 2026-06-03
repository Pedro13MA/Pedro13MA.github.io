# Spotter Intelligence Hub — Website

Landing page premium para o **Spotter Intelligence Hub** (V10.4) — motor autónomo de price intelligence para o mercado português. Publica deals validados no Telegram [@spotter_deals](https://t.me/spotter_deals).

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Framer Motion** — animações subtis com `prefers-reduced-motion`
- **Lucide React** — ícones
- Export estático (`output: 'export'`) — compatível com GitHub Pages e Vercel

## Desenvolvimento local

### Se `npm` não for reconhecido (Windows)

**Opção mais fácil** — duplo-clique ou corre no terminal (não precisa de política PowerShell):

```cmd
cd "C:\Users\Utilizador\Desktop\Spotter Site\Pedro13MA.github.io"
install.cmd
dev.cmd
```

Ou cola isto no PowerShell (funciona sempre):

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" run dev
```

**Importante:** depois de instalar o Node.js, fecha **todo o Cursor** ou reinicia o PC para `npm` funcionar sem caminho completo.

### Comando normal (quando `node` e `npm` já funcionam)

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Build de produção

```bash
npm run build
```

A pasta `out/` contém o site estático pronto para deploy.

## Deploy

### Vercel (recomendado)

1. Importa o repositório em [vercel.com](https://vercel.com)
2. Framework: Next.js — deploy automático

### GitHub Pages

1. **Settings → Pages → Source:** GitHub Actions
2. Faz push para `main` — o workflow `.github/workflows/deploy.yml` faz build e publica a pasta `out/`
3. Site em `https://pedro13ma.github.io`

## Estrutura

```
src/
├── app/              # layout, page, OG image, 404
├── components/       # Navbar, secções, UI
├── hooks/            # useReducedMotion
└── lib/              # constants, utils
public/               # robots.txt, sitemap, favicon
DESIGN_SYSTEM.md      # tokens e componentes
```

## Personalizar

- Canal Telegram: `src/lib/constants.ts` → `TELEGRAM_CHANNEL`
- URL do site / SEO: `SITE_URL` em `constants.ts` e `layout.tsx`

## Autor

Pedro Martins · Lisboa, Portugal · Spotter Intelligence Hub V10.4
