"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

type Point = { x: string | number; y: number };

export function Sparkline({
  data,
  color = "#5b8cff",
  height = 40,
}: {
  data: Point[];
  color?: string;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            dataKey="y"
            stroke={color}
            strokeWidth={1.6}
            fill={`url(#spark-${color})`}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
