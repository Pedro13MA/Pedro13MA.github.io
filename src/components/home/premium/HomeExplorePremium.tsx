import Link from "next/link";
import {
  CatCasaIcon,
  CatGamingIcon,
  CatLaptopIcon,
  CatPhoneIcon,
  CatPhotoIcon,
  CatTvIcon,
} from "@/components/home/premium/illustrations";

const CATEGORIES = [
  {
    slug: "gaming",
    label: "Gaming",
    description: "GPUs, consolas e periféricos — com histórico, não só o preço do dia.",
    Icon: CatGamingIcon,
  },
  {
    slug: "casa",
    label: "Casa",
    description: "Eletrodomésticos e equipamento — decide com evidência temporal.",
    Icon: CatCasaIcon,
  },
  {
    slug: "telemoveis",
    label: "Telemóveis",
    description: "Smartphones observados ao longo do tempo, sem hype de lançamento.",
    Icon: CatPhoneIcon,
  },
  {
    slug: "informatica",
    label: "Informática",
    description: "Portáteis e componentes — quando o preço cruza o limiar certo.",
    Icon: CatLaptopIcon,
  },
  {
    slug: "tv_audio",
    label: "TV e Áudio",
    description: "Ecrãs e som com leitura honesta do histórico.",
    Icon: CatTvIcon,
  },
  {
    slug: "fotografia",
    label: "Fotografia",
    description: "Câmaras e ópticas — sem forçar uma compra prematura.",
    Icon: CatPhotoIcon,
  },
] as const;

export function HomeExplorePremium() {
  return (
    <section
      id="categorias"
      className="scroll-mt-20 border-b border-[var(--hm-line)]"
      aria-labelledby="home-explore-title"
    >
      <div className="home-fade mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--hm-faint)]">
          Explorar
        </p>
        <h2
          id="home-explore-title"
          className="mt-4 font-display text-2xl font-semibold tracking-tight text-[var(--hm-text)] sm:text-4xl"
        >
          Categorias
        </h2>
        <p className="mt-4 max-w-xl text-[15px] text-[var(--hm-muted)]">
          Entra por tema — a decisão continua a ser sobre o momento, não só a loja.
        </p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ slug, label, description, Icon }) => (
            <li key={slug}>
              <Link
                href={`/categoria/${slug}/`}
                className="home-surface flex h-full flex-col p-6 transition-colors duration-150 sm:p-7"
              >
                <Icon className="h-16 w-16" />
                <h3 className="mt-5 font-display text-lg font-semibold text-[var(--hm-text)]">
                  {label}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--hm-faint)]">
                  {description}
                </p>
                <span className="mt-5 text-sm text-[var(--hm-brand)]">Ver →</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm">
          <Link
            href="/categorias/"
            className="text-[var(--hm-muted)] transition-colors duration-150 hover:text-[var(--hm-brand)]"
          >
            Todas as categorias →
          </Link>
          <span className="mx-3 text-[var(--hm-faint)]">·</span>
          <Link
            href="/mercado/"
            className="text-[var(--hm-muted)] transition-colors duration-150 hover:text-[var(--hm-brand)]"
          >
            Mercado
          </Link>
          <span className="mx-3 text-[var(--hm-faint)]">·</span>
          <Link
            href="/catalogo/"
            className="text-[var(--hm-muted)] transition-colors duration-150 hover:text-[var(--hm-brand)]"
          >
            Catálogo
          </Link>
        </p>
      </div>
    </section>
  );
}
