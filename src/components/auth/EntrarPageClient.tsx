"use client";

import { Suspense, useEffect, type ComponentType } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  FolderKanban,
  GitCompare,
  Heart,
  History,
  LineChart,
  List,
  ShoppingCart,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { LoginButton } from "@/components/auth/LoginButton";
import { LoadingAuth } from "@/components/auth/LoadingAuth";
import { useSession } from "@/components/auth/SessionProvider";
import { LymiarLogo } from "@/components/ui/LymiarLogo";
import {
  AlertsPreview,
  CartPreview,
  ComparePreview,
  FavoritesPreview,
  HistoryPreview,
  ListsPreview,
  ProjectsPreview,
  TimelinePreview,
} from "@/components/auth/entrar-previews";
import "@/components/catalogo/catalog-premium.css";

type Feature = {
  title: string;
  body: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  Preview: ComponentType<{ className?: string }>;
};

const FEATURES: Feature[] = [
  {
    title: "Favoritos",
    body: "Guarda produtos e acompanha a evolução dos preços ao longo do tempo.",
    Icon: Heart,
    Preview: FavoritesPreview,
  },
  {
    title: "Alertas inteligentes",
    body: "Recebe notificações apenas quando o momento de compra muda.",
    Icon: Bell,
    Preview: AlertsPreview,
  },
  {
    title: "Timeline",
    body: "Vê as alterações importantes de preço nos produtos que segues.",
    Icon: History,
    Preview: TimelinePreview,
  },
  {
    title: "Carrinho inteligente",
    body: "O carrinho continua a acompanhar preços mesmo depois de o fechares.",
    Icon: ShoppingCart,
    Preview: CartPreview,
  },
  {
    title: "Projetos",
    body: "Cria builds de PC, renovações de casa ou listas de compras complexas.",
    Icon: FolderKanban,
    Preview: ProjectsPreview,
  },
  {
    title: "Listas",
    body: "Organiza produtos por tema — viagem, escritório ou qualquer projeto.",
    Icon: List,
    Preview: ListsPreview,
  },
  {
    title: "Comparador",
    body: "Compara vários produtos lado a lado antes de tomar uma decisão.",
    Icon: GitCompare,
    Preview: ComparePreview,
  },
  {
    title: "Histórico completo",
    body: "Consulta meses ou anos de evolução dos preços observados.",
    Icon: LineChart,
    Preview: HistoryPreview,
  },
];

function EntrarInner() {
  const { status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/minha-area/";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(next.startsWith("/") ? next : "/minha-area/");
    }
  }, [status, router, next]);

  if (status === "loading" || status === "authenticated") {
    return <LoadingAuth />;
  }

  return (
    <main className="entrar-shell">
      <div className="entrar-grid">
        <section className="entrar-login" aria-labelledby="entrar-title">
          <div className="entrar-login-card catalog-panel">
            <div className="flex items-center gap-3">
              <LymiarLogo size={48} alt="Lymiar" priority />
              <p className="catalog-kicker">Área pessoal</p>
            </div>

            <h1 id="entrar-title" className="entrar-title font-display">
              O Lymiar trabalha por ti, mesmo quando fechas o site.
            </h1>

            <p className="entrar-lead">
              Mais do que uma conta — o teu espaço no Lymiar. Guarda produtos,
              acompanha preços reais, cria projetos, organiza listas, recebe
              alertas e continua exactamente onde paraste em qualquer
              dispositivo.
            </p>

            <ul className="entrar-promise">
              <li>Guarda o que te interessa e acompanha a decisão no tempo</li>
              <li>Avisa quando o momento de compra muda</li>
              <li>Sincroniza favoritos, listas, projetos e carrinho</li>
            </ul>

            <LoginButton
              provider="google"
              className="catalog-cta entrar-cta h-12 w-full border-0 text-base shadow-none hover:bg-[var(--hm-brand-deep)]"
            />

            <p className="entrar-footnote">
              Sem password — autenticação com Google. Os dados de preço
              continuam a ser os observados no catálogo; a conta só guarda o que
              é importante para ti.
            </p>
          </div>
        </section>

        <section className="entrar-unlock" aria-labelledby="entrar-unlock-title">
          <div className="entrar-unlock-head">
            <p className="catalog-kicker">O que desbloqueias</p>
            <h2
              id="entrar-unlock-title"
              className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--hm-ink)] sm:text-3xl"
            >
              A tua área pessoal de compras
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--hm-muted)] sm:text-base">
              Tudo o que precisas para decidir quando comprar, acompanhar preços
              e organizar futuras compras — sincronizado em todos os teus
              dispositivos.
            </p>
          </div>

          <ul className="entrar-features">
            {FEATURES.map(({ title, body, Icon, Preview }) => (
              <li key={title} className="entrar-feature catalog-card">
                <Preview className="entrar-feature-preview" />
                <div className="entrar-feature-body">
                  <div className="flex items-center gap-2.5">
                    <span className="entrar-feature-icon" aria-hidden>
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-base font-semibold text-[var(--hm-ink)]">
                      {title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--hm-muted)]">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

export function EntrarPageClient() {
  return (
    <div className="catalog-premium">
      <SiteHeader />
      <Suspense fallback={<LoadingAuth />}>
        <EntrarInner />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
