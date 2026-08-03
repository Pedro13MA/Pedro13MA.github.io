"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { LoadingAuth } from "@/components/auth/LoadingAuth";
import { useSession } from "@/components/auth/SessionProvider";

function CallbackInner() {
  const { acceptToken, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      void acceptToken(token).then(() => {
        router.replace("/perfil/");
      });
      return;
    }
    if (status === "authenticated") {
      router.replace("/perfil/");
    } else if (status === "unauthenticated") {
      router.replace("/entrar/");
    }
  }, [params, acceptToken, router, status]);

  return <LoadingAuth label="A concluir autenticação…" />;
}

export function EntrarCallbackClient() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<LoadingAuth />}>
        <CallbackInner />
      </Suspense>
      <SiteFooter />
    </>
  );
}
