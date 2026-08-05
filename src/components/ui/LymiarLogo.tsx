import Image from "next/image";
import { cn } from "@/lib/utils";

export const LYMIAR_LOGO_SRC = "/brand/lymiar-logotipo.png";

type Props = {
  className?: string;
  /** Lado do quadrado em px CSS */
  size?: number;
  priority?: boolean;
  /** Vazio = decorativo (aria-hidden). */
  alt?: string;
};

/**
 * Logótipo Lymiar — asset oficial em /brand/lymiar-logotipo.png
 * (monograma LY + wordmark sobre fundo navy).
 */
export function LymiarLogo({
  className,
  size = 32,
  priority = false,
  alt = "",
}: Props) {
  return (
    <Image
      src={LYMIAR_LOGO_SRC}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn(
        "rounded-lg object-cover",
        className ?? "shadow-sm ring-1 ring-slate-900/10",
      )}
      aria-hidden={alt ? undefined : true}
    />
  );
}
