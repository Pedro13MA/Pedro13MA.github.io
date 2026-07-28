type Props = {
  className?: string;
  /** Altura/largura do viewBox em px CSS */
  size?: number;
};

/**
 * Logótipo Limiar — "L" em slate-900 + tendência teal a descer até ponto esmeralda.
 */
export function LimiarLogo({ className, size = 32 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* L estilizado */}
      <path
        d="M18 12v36h28"
        stroke="#0f172a"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Linha de tendência (preço a descer) */}
      <path
        d="M26 28c6 2 10 8 14 14 3 4 7 8 12 10"
        stroke="#0d9488"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Ponto esmeralda no vértice / mínimo */}
      <circle cx="52" cy="52" r="5" fill="#059669" />
      <circle cx="52" cy="52" r="2.2" fill="#ecfdf5" />
    </svg>
  );
}
