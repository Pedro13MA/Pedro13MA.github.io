"use client";

import { buildSpecRows } from "@/lib/product-content";
import type { Product } from "@/lib/types";

type Props = { product: Product };

export function ProductSpecs({ product }: Props) {
  const rows = buildSpecRows(product);
  if (!rows.length) return null;

  return (
    <section id="especificacoes" className="scroll-mt-20 space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Especificações
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Atributos tipados da taxonomy — apenas valores existentes no catálogo.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.key}
                className={i % 2 === 0 ? "bg-white" : "bg-slate-50/80"}
              >
                <th
                  scope="row"
                  className="w-[40%] px-4 py-3 text-left font-medium text-slate-500"
                >
                  {row.label}
                </th>
                <td className="px-4 py-3 font-medium text-slate-900">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
