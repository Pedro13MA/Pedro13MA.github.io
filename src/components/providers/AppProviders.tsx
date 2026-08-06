"use client";

import { SnackbarProvider } from "@/components/user-space/Snackbar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SyncBootstrap } from "@/components/sync/SyncUI";
import { isP32NavigationEnabled } from "@/lib/nav/flags";
import { TaxonomyTreeProvider } from "@/components/nav/TaxonomyTreeProvider";
import { ApiMetricsPanel } from "@/components/dev/ApiMetricsPanel";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const body = (
    <AuthProvider>
      <SnackbarProvider>
        <SyncBootstrap />
        {children}
        <ApiMetricsPanel />
      </SnackbarProvider>
    </AuthProvider>
  );

  if (!isP32NavigationEnabled()) return body;

  return <TaxonomyTreeProvider>{body}</TaxonomyTreeProvider>;
}
