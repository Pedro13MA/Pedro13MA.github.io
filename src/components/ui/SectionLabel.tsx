export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-indigo-400 text-xs font-medium tracking-[0.08em] uppercase">
      {children}
    </span>
  );
}
