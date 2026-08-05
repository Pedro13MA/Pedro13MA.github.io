"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { LoginButtons } from "@/components/auth/LoginButton";
import { LoadingAuth } from "@/components/auth/LoadingAuth";
import { useSession } from "@/components/auth/SessionProvider";
import { LymiarLogo } from "@/components/ui/LymiarLogo";

function EntrarInner() {
  const { status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/minha-area/";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(next.startsWith("/") ? next : "/minha-area/");
    }
  }, [status, router, next]);

  if (status === "loading" || status === "authenticated") {
    return <LoadingAuth />;
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-5 text-center">
        <LymiarLogo size={72} alt="Lymiar" priority />
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Entrar
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Continua com a tua conta. Sem password.
          </p>
        </div>
      </div>
      <LoginButtons />
    </main>
  );
}

export function EntrarPageClient() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<LoadingAuth />}>
        <EntrarInner />
      </Suspense>
      <SiteFooter />
    </>
  );
}
