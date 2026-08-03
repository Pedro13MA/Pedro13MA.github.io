"use client";

import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSession } from "@/components/auth/SessionProvider";
import { Button } from "@/components/ui/button";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      dateStyle: "long",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function PerfilBody() {
  const { user, signOut } = useSession();
  if (!user) return null;

  const initial = (user.name || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <main className="mx-auto max-w-lg space-y-8 px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900">Perfil</h1>
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-24 w-24 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-2xl font-semibold text-slate-600"
            aria-hidden
          >
            {initial}
          </div>
        )}
        <dl className="w-full space-y-3 text-sm">
          <div>
            <dt className="text-slate-400">Nome</dt>
            <dd className="font-medium text-slate-900">{user.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Email</dt>
            <dd className="font-medium text-slate-900">{user.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Provider</dt>
            <dd className="font-medium capitalize text-slate-900">
              {user.provider}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Data de adesão</dt>
            <dd className="font-medium text-slate-900">
              {formatDate(user.createdAt)}
            </dd>
          </div>
        </dl>
        <Button
          type="button"
          variant="secondary"
          className="mt-4 w-full"
          onClick={() => void signOut()}
        >
          Terminar sessão
        </Button>
      </div>
    </main>
  );
}

export function PerfilPageClient() {
  return (
    <>
      <SiteHeader />
      <ProtectedRoute>
        <PerfilBody />
      </ProtectedRoute>
      <SiteFooter />
    </>
  );
}
