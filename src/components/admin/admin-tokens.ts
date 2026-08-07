/** Admin Control Center — tokens alinhados ao site Lymiar (claro). */
export const ADMIN_CSS = `
.admin-shell {
  /* Espelho de catalog-premium / homepage */
  --admin-bg: #f4f6f8;
  --admin-bg-soft: #eef2f6;
  --admin-surface: #ffffff;
  --admin-surface-2: #f8fafc;
  --admin-border: #dde3ea;
  --admin-border-strong: #c5ced8;
  --admin-text: #0b1220;
  --admin-muted: #5b6b7c;
  --admin-faint: #8b9aab;
  --admin-brand: #ff6a1a;
  --admin-brand-soft: #fff1e8;
  --admin-brand-deep: #e2550f;
  --admin-ok: #12b76a;
  --admin-ok-soft: #ecfdf3;
  --admin-warn: #f5a524;
  --admin-warn-soft: #fff8eb;
  --admin-critical: #ef4444;
  --admin-critical-soft: #fef2f2;
  --admin-track: #e8eef3;
  --admin-hover: rgba(11, 18, 32, 0.04);
  --admin-sidebar: 248px;
  --admin-sidebar-collapsed: 72px;
  --admin-topbar: 56px;
  color-scheme: light;
  background:
    linear-gradient(180deg, #ffffff 0%, rgba(240, 249, 255, 0.55) 28%, #f4f6f8 100%);
  color: var(--admin-text);
  min-height: 100vh;
  font-family: var(--font-sans);
}

.admin-shell * {
  box-sizing: border-box;
}

.admin-shell a {
  color: inherit;
  text-decoration: none;
}

.admin-shell ::selection {
  background: rgba(255, 106, 26, 0.22);
  color: #0b1220;
}

.admin-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.admin-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.admin-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.admin-scroll:hover::-webkit-scrollbar-thumb {
  background: #94a3b8;
}
`;
