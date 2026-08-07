import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { EnrichmentCoverageView } from "@/components/admin/enrichment/EnrichmentCoverageView";

export default function ConhecimentoPage() {
  return (
    <RequireAdmin>
      <EnrichmentCoverageView />
    </RequireAdmin>
  );
}
