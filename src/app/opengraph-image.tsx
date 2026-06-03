import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const alt = "Spotter Intelligence Hub — Descontos reais, validados";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0A0A0B 0%, #1a1a2e 50%, #0A0A0B 100%)",
          color: "#FAFAFA",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "2px solid #6366F1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#818CF8",
            }}
          >
            S
          </div>
          <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em" }}>
            Spotter<span style={{ color: "#6366F1" }}>.</span>
          </span>
        </div>
        <p
          style={{
            fontSize: 36,
            fontWeight: 600,
            lineHeight: 1.2,
            maxWidth: 900,
            letterSpacing: "-0.02em",
          }}
        >
          A inteligência que encontra descontos reais
        </p>
        <p style={{ fontSize: 24, color: "#A1A1AA", marginTop: 24 }}>
          Price Intelligence · Telegram @spotter_deals · V10.4
        </p>
      </div>
    ),
    { ...size }
  );
}
