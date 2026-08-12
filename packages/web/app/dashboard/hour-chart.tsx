"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function HourChart({ data }: { data: { hour: string; count: number }[] }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
          <XAxis dataKey="hour" stroke="#737373" fontSize={10} interval={2} />
          <YAxis stroke="#737373" fontSize={10} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8 }}
            labelStyle={{ color: "#e5e5e5" }}
            labelFormatter={(h) => `${h}:00 UTC`}
          />
          <Bar dataKey="count" fill="#10b981" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}