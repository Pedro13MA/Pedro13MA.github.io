"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import type { ChartPoint } from "@/types/admin";

type Props = {
  title: string;
  data: ChartPoint[];
  className?: string;
  color?: string;
};

export function MiniChart({
  title,
  data,
  className,
  color = "#ff6a1a",
}: Props) {
  const gradId = `admin-chart-${title.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-medium text-[var(--admin-muted)]">{title}</p>
      <div className="mt-3 h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8b9aab", fontSize: 10 }}
            />
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #dde3ea",
                borderRadius: 8,
                fontSize: 12,
                color: "#0b1220",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              }}
              labelStyle={{ color: "#5b6b7c" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#${gradId})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
