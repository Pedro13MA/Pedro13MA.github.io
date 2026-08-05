"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { TELEGRAM_CHANNEL } from "@/lib/constants";
import { LymiarLogo } from "@/components/ui/LymiarLogo";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { MegaMenu, MegaMenuTrigger } from "@/components/nav/MegaMenu";
import { MobileNavDrawer } from "@/components/nav/MobileNavDrawer";
import { useTaxonomyNav } from "@/components/nav/TaxonomyTreeProvider";
import { SearchTypeahead } from "@/components/search/SearchTypeahead";

export function SiteHeaderP32() {
  const { megaMenu, loading } = useTaxonomyNav();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const triggerId = useId();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold tracking-tight text-slate-900"
          aria-label="Lymiar — início"
        >
          <LymiarLogo size={36} alt="Lymiar" priority />
        </Link>

        <nav
          className="hidden items-center gap-3 lg:flex"
          aria-label="Principal"
        >
          <div className="relative">
            <MegaMenuTrigger
              id={triggerId}
              open={menuOpen}
              onOpenChange={setMenuOpen}
            />
          </div>
          <Link href="/mercado/" className="text-sm text-slate-600 hover:text-slate-900">
            Mercado
          </Link>
        </nav>

        <div className="ml-auto min-w-0 flex-1 max-w-md lg:ml-4" role="search">
          <SearchTypeahead compact placeholder="Pesquisar produto…" />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 disabled:opacity-50 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="p32-mobile-nav"
            disabled={loading && !megaMenu}
            onClick={() => setMobileOpen(true)}
          >
            Menu
          </button>
          <NotificationBell />
          <UserMenu />
          <a
            href={TELEGRAM_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm sm:inline-flex"
          >
            Telegram
          </a>
        </div>

        {!loading && megaMenu ? (
          <MegaMenu
            model={megaMenu}
            open={menuOpen}
            onOpenChange={setMenuOpen}
            triggerId={triggerId}
          />
        ) : null}
      </div>

      <MobileNavDrawer
        id="p32-mobile-nav"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        model={megaMenu}
      />
    </header>
  );
}
