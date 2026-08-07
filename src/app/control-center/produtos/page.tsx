import { Suspense } from "react";
import { ProductsAdminView } from "@/components/admin/products/ProductsAdminView";
import { LoadingState } from "@/components/admin/shared";

export default function AdminProdutosPage() {
  return (
    <Suspense fallback={<LoadingState rows={4} />}>
      <ProductsAdminView />
    </Suspense>
  );
}
