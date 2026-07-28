import { CouponCard } from "@/components/cupoes/CouponCard";
import type { Promotion } from "@/lib/types";

type Props = { promotion: Promotion };

/** @deprecated Prefer CouponCard — mantido para compatibilidade. */
export function PromotionCard({ promotion }: Props) {
  return <CouponCard promotion={promotion} />;
}
