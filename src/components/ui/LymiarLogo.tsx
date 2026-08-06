import Image from "next/image";
import { cn } from "@/lib/utils";

/** Kit oficial — ver `scripts/generate_brand_icons.py` e Desktop/LYMIAR. */
export const LYMIAR_LOGO = {
  /** 1.png — vertical centrada (social, entrar, OG). */
  primary: "/brand/lymiar-logo-primary.png",
  /** 2.png — com respiro (perfil / apple-touch). */
  square: "/brand/lymiar-logo-square.png",
  /** 3.png — horizontal (navbar / footer). */
  horizontal: "/brand/lymiar-logo-horizontal.png",
  /** 4.png — isotipo (favicon pequeno / app icon). */
  mark: "/brand/lymiar-mark.png",
  /** Alias legado → primary. */
  legacy: "/brand/lymiar-logotipo.png",
} as const;

export type LymiarLogoVariant = keyof typeof LYMIAR_LOGO;

/** @deprecated prefer LYMIAR_LOGO.primary / .horizontal */
export const LYMIAR_LOGO_SRC = LYMIAR_LOGO.legacy;

type Props = {
  className?: string;
  /**
   * Altura em px CSS. Em `horizontal` a largura segue o aspect ratio (~2.5:1).
   * Em variantes quadradas/verticais usa-se um lado igual a `size`.
   */
  size?: number;
  /** Default `horizontal` — cabeçalho / navbar. */
  variant?: LymiarLogoVariant;
  priority?: boolean;
  /** Vazio = decorativo (aria-hidden). */
  alt?: string;
};

const ASPECT: Record<LymiarLogoVariant, number> = {
  primary: 1219 / 1516,
  square: 1429 / 1382,
  horizontal: 1693 / 820,
  mark: 664 / 944,
  legacy: 1219 / 1516,
};

/**
 * Logótipo Lymiar — variantes do kit oficial (leão + coroa).
 */
export function LymiarLogo({
  className,
  size = 32,
  variant = "horizontal",
  priority = false,
  alt = "",
}: Props) {
  const src = LYMIAR_LOGO[variant];
  const ratio = ASPECT[variant];
  const isHorizontal = variant === "horizontal";
  const height = size;
  const width = isHorizontal ? Math.round(size * ratio) : size;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn(
        "object-contain",
        isHorizontal ? "h-auto w-auto" : "rounded-lg",
        className,
      )}
      style={
        isHorizontal
          ? { height: size, width: "auto", maxHeight: size }
          : undefined
      }
      aria-hidden={alt ? undefined : true}
    />
  );
}
