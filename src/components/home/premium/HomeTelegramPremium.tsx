import { TELEGRAM_CHANNEL } from "@/lib/constants";
import Link from "next/link";
import {
  CatCasaIcon,
  CatGamingIcon,
  CatLaptopIcon,
  CatPhoneIcon,
  CatPhotoIcon,
  CatTvIcon,
} from "@/components/home/premium/illustrations";

export function HomeTelegramPremium() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:max-w-7xl">
        <p className="text-sm font-semibold text-[var(--hm-brand)]">Canal</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-slate-900">
          Também no Telegram
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          O canal serve para receberes promoções que o nosso radar marca como
          realmente boas — com mínimo histórico observado, não com descontos
          inventados. Chegam de todas as categorias.
        </p>
        <a
          href={TELEGRAM_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex h-11 items-center rounded-xl bg-[var(--hm-brand)] px-6 text-sm font-semibold text-white hover:bg-[var(--hm-brand-deep)]"
        >
          Abrir canal →
        </a>
      </div>
    </section>
  );
}

const CATEGORIES = [
  {
    slug: "gaming",
    label: "Gaming",
    description: "Ex.: gráficas, consolas, periféricos.",
    Icon: CatGamingIcon,
  },
  {
    slug: "casa",
    label: "Casa",
    description: "Ex.: frigoríficos, aspiradores, cozinha.",
    Icon: CatCasaIcon,
  },
  {
    slug: "telemoveis",
    label: "Telemóveis",
    description: "Smartphones e acessórios.",
    Icon: CatPhoneIcon,
  },
  {
    slug: "informatica",
    label: "Informática",
    description: "Portáteis, SSDs e componentes.",
    Icon: CatLaptopIcon,
  },
  {
    slug: "tv_audio",
    label: "TV e Áudio",
    description: "Televisores e som.",
    Icon: CatTvIcon,
  },
  {
    slug: "fotografia",
    label: "Fotografia",
    description: "Câmaras e objectivas.",
    Icon: CatPhotoIcon,
  },
] as const;

export function HomeExplorePremium() {
  return (
    <section id="categorias" className="scroll-mt-20 border-b border-slate-200 bg-white">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:max-w-7xl">
        <p className="text-sm font-semibold text-[var(--hm-brand)]">Explorar</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900">
          Várias categorias para explorares
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          Procuras uma gráfica? Temos essa categoria. Um frigorífico? Também.
          Em todas a pergunta é a mesma: vale a pena comprar agora?
        </p>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-500">
          Não queres ser enganado com promoções falsas que sobem o preço dias
          antes para o desconto parecer maior — nós cruzamos com o histórico
          observado para te ajudar nisso.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ slug, label, description, Icon }) => (
            <li key={slug}>
              <Link
                href={`/categoria/${slug}/`}
                className="home-card flex h-full gap-4 p-5 hover:border-orange-200"
              >
                <Icon className="h-16 w-16 shrink-0" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-slate-900">
                    {label}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-slate-500">
          <Link href="/categorias/" className="font-semibold text-[var(--hm-brand)] hover:underline">
            Ver todas as categorias →
          </Link>
        </p>
      </div>
    </section>
  );
}
