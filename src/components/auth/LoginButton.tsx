"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/components/auth/SessionProvider";
import {
  AUTH_PROVIDER_LABELS,
  type AuthProviderId,
} from "@/auth.config";
import { cn } from "@/lib/utils";

export function LoginButton({
  provider,
  className,
}: {
  provider: AuthProviderId;
  className?: string;
}) {
  const { signIn, status } = useSession();
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      className={cn("w-full justify-center", className)}
      disabled={status === "loading"}
      onClick={() => signIn(provider)}
    >
      {AUTH_PROVIDER_LABELS[provider]}
    </Button>
  );
}

export function LoginButtons({
  className,
  providers = ["google"],
}: {
  className?: string;
  /** Por omissão só Google (UI /entrar). */
  providers?: AuthProviderId[];
}) {
  const list = providers.length ? providers : (["google"] as AuthProviderId[]);
  return (
    <div className={cn("flex w-full max-w-sm flex-col gap-3", className)}>
      {list.map((id) => (
        <LoginButton key={id} provider={id} />
      ))}
    </div>
  );
}
