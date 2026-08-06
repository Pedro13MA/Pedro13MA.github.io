"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Altura mínima do placeholder antes de montar filhos */
  minHeight?: string;
  /** Margem extra antes de montar (ex.: pré-carregar ao aproximar) */
  rootMargin?: string;
};

/** Monta filhos só quando a secção entra (ou aproxima-se) do viewport. */
export function LazySection({
  children,
  minHeight = "12rem",
  rootMargin = "240px 0px",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Já no viewport (ou webviews sem IO fiável): montar já.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 280) {
      setVisible(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={!visible ? { minHeight } : undefined}>
      {visible ? children : null}
    </div>
  );
}
