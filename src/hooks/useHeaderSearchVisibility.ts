"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Marker no hero da homepage — o header observa este nó. */
export const HOME_HERO_SEARCH_ID = "home-hero-search";

export type HeaderSearchVisibility = {
  /** Mostrar pesquisa compacta no header. */
  showHeaderSearch: boolean;
  /** Hero search ainda visível (só relevante na homepage). */
  isHeroSearchVisible: boolean;
  isHome: boolean;
};

/**
 * Na homepage: pesquisa no header só depois do hero sair do ecrã.
 * Noutras páginas: sempre (exceto /entrar).
 */
export function useHeaderSearchVisibility(): HeaderSearchVisibility {
  const pathname = usePathname();
  const hideForAuth = Boolean(pathname?.startsWith("/entrar"));
  const isHome = pathname === "/" || pathname === "";

  const [heroInView, setHeroInView] = useState(isHome);

  useEffect(() => {
    if (hideForAuth) return;

    if (!isHome) {
      setHeroInView(false);
      return;
    }

    let cancelled = false;
    let io: IntersectionObserver | null = null;
    let pollId = 0;

    const observe = (el: HTMLElement) => {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!cancelled && entry) setHeroInView(entry.isIntersecting);
        },
        {
          root: null,
          threshold: 0,
          rootMargin: "-64px 0px 0px 0px",
        },
      );
      io.observe(el);
    };

    const tryAttach = (): boolean => {
      const el = document.getElementById(HOME_HERO_SEARCH_ID);
      if (!el) return false;
      setHeroInView(true);
      observe(el);
      return true;
    };

    if (!tryAttach()) {
      setHeroInView(true);
      pollId = window.setInterval(() => {
        if (cancelled) return;
        if (tryAttach()) window.clearInterval(pollId);
      }, 40);
    }

    return () => {
      cancelled = true;
      if (pollId) window.clearInterval(pollId);
      io?.disconnect();
    };
  }, [isHome, hideForAuth, pathname]);

  if (hideForAuth) {
    return {
      showHeaderSearch: false,
      isHeroSearchVisible: false,
      isHome,
    };
  }

  return {
    showHeaderSearch: !heroInView,
    isHeroSearchVisible: isHome ? heroInView : false,
    isHome,
  };
}
