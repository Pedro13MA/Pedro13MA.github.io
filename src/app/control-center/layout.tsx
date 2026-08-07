import type { Metadata } from "next";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { AdminShell } from "@/components/admin/shell/AdminShell";

export const metadata: Metadata = {
  title: "Control Center",
  robots: { index: false, follow: false },
};

export default function ControlCenterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireAdmin>
      <AdminShell>{children}</AdminShell>
    </RequireAdmin>
  );
}
