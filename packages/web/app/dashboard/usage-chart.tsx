"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function UsageChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis dataKey="date" stroke="#737373" fontSize={12} />
          <YAxis stroke="#737373" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8 }}
            labelStyle={{ color: "#e5e5e5" }}
          />
          <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}