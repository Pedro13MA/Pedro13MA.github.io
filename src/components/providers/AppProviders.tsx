"use client";

import { SnackbarProvider } from "@/components/user-space/Snackbar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SyncBootstrap } from "@/components/sync/SyncUI";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <SyncBootstrap />
        {children}
      </SnackbarProvider>
    </AuthProvider>
  );
}
