import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-display font-bold text-white text-lg tracking-tight ${className}`}>
      <span className="relative flex h-8 w-8 items-center justify-center" aria-hidden="true">
        <span className="absolute h-8 w-8 rounded-full border border-indigo-500/30" />
        <span className="absolute h-5 w-5 rounded-full border border-indigo-500/50" />
        <span className="absolute h-2 w-2 rounded-full bg-indigo-500" />
        <span className="font-mono text-xs font-bold text-indigo-400">S</span>
      </span>
      <span>
        Spotter<span className="text-indigo-400">.</span>
      </span>
    </Link>
  );
}
