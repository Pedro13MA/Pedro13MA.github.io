import Link from "next/link";
import type { BreadcrumbCrumb } from "@/lib/product-breadcrumb";

type Props = {
  crumbs: BreadcrumbCrumb[];
};

export function ProductBreadcrumb({ crumbs }: Props) {
  if (!crumbs.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden className="text-slate-300">
                  ›
                </span>
              ) : null}
              {crumb.href && !last ? (
                <Link href={crumb.href} className="hover:text-slate-800">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={last ? "font-medium text-slate-700" : undefined}
                  aria-current={last ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
