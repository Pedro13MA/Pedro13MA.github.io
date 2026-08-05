import { TELEGRAM_CHANNEL } from "@/lib/constants";
import { TelegramArt } from "@/components/home/premium/illustrations";
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
      <div className="home-fade mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:max-w-7xl lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-blue-600">Canal</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900">
            Telegram
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500">
            As melhores oportunidades chegam primeiro ao Telegram — verificadas,
            sem substituir a decisão na página do produto.
          </p>
          <a
            href={TELEGRAM_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-11 items-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Abrir canal →
          </a>
        </div>
        <div className="flex justify-center lg:justify-end">
          <TelegramArt className="h-auto w-full max-w-sm" />
        </div>
      </div>
    </section>
  );
}

const CATEGORIES = [
  {
    slug: "gaming",
    label: "Gaming",
    description: "GPUs e periféricos com leitura temporal.",
    Icon: CatGamingIcon,
  },
  {
    slug: "casa",
    label: "Casa",
    description: "Eletrodomésticos — decide com evidência.",
    Icon: CatCasaIcon,
  },
  {
    slug: "telemoveis",
    label: "Telemóveis",
    description: "Smartphones sem hype de lançamento.",
    Icon: CatPhoneIcon,
  },
  {
    slug: "informatica",
    label: "Informática",
    description: "Portáteis e componentes no limiar certo.",
    Icon: CatLaptopIcon,
  },
  {
    slug: "tv_audio",
    label: "TV e Áudio",
    description: "Ecrãs e som com histórico honesto.",
    Icon: CatTvIcon,
  },
  {
    slug: "fotografia",
    label: "Fotografia",
    description: "Câmaras sem forçar a compra.",
    Icon: CatPhotoIcon,
  },
] as const;

export function HomeExplorePremium() {
  return (
    <section id="categorias" className="scroll-mt-20 border-b border-slate-200 bg-white">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:max-w-7xl">
        <p className="text-sm font-semibold text-blue-600">Explorar</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900">
          Categorias
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ slug, label, description, Icon }) => (
            <li key={slug}>
              <Link
                href={`/categoria/${slug}/`}
                className="home-card flex h-full gap-4 p-5 hover:border-blue-200"
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
      </div>
    </section>
  );
}
