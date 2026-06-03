import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gradient-mesh">
      <Logo />
      <h1 className="font-display mt-12 text-4xl font-semibold text-white">404</h1>
      <p className="mt-4 text-zinc-400 text-center max-w-md">
        Esta página não passou pelo pipeline de decisão — ou simplesmente não existe.
      </p>
      <Button href="/" variant="secondary" className="mt-8">
        Voltar ao início
      </Button>
      <Link
        href="https://t.me/spotter_deals"
        className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ir para o Telegram →
      </Link>
    </div>
  );
}
