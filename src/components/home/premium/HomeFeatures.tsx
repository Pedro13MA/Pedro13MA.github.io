import Link from "next/link";
import {
  Bell,
  Bot,
  GitCompare,
  Heart,
  History,
  LayoutGrid,
  LineChart,
  Search,
  Send,
  ShoppingCart,
  Ticket,
  FolderKanban,
} from "lucide-react";

const FEATURES = [
  { href: "/search/", label: "Pesquisa inteligente", Icon: Search },
  { href: "/comparar/", label: "Comparador", Icon: GitCompare },
  { href: "/favoritos/", label: "Favoritos", Icon: Heart },
  { href: "/projetos/", label: "Projetos", Icon: FolderKanban },
  { href: "/carrinho/", label: "Carrinho", Icon: ShoppingCart },
  { href: "/timeline/", label: "Timeline", Icon: History },
  { href: "https://t.me/spotter_deals", label: "Telegram", Icon: Send, external: true },
  { href: "/alertas/", label: "Alertas", Icon: Bell },
  { href: "/#cupoes", label: "Cupões", Icon: Ticket },
  { href: "/mercado/", label: "Histórico", Icon: LineChart },
  { href: "/mercado/", label: "Estatísticas", Icon: LayoutGrid },
  { href: "/#diferenca", label: "Análise", Icon: Bot },
] as const;

export function HomeFeatures() {
  return (
    <section id="funcionalidades" className="scroll-mt-20 border-b border-slate-200 bg-white">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl">
        <p className="text-sm font-semibold text-blue-600">Plataforma</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Funcionalidades
        </h2>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {FEATURES.map(({ href, label, Icon, ...rest }) => {
            const external = "external" in rest && rest.external;
            const className =
              "home-card flex flex-col items-start gap-3 p-5 transition-colors hover:border-blue-200";
            const inner = (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-slate-900">{label}</span>
              </>
            );
            return (
              <li key={label}>
                {external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                    {inner}
                  </a>
                ) : (
                  <Link href={href} className={className}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
