'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

type RevenuePoint = {
  month: string; // YYYY-MM
  network_revenue: number;
  direct_referrals: number;
  advisory_revenue: number;
};

export function FoundingRevenueCharts({
  revenueSeries,
  breakdown,
}: {
  revenueSeries: RevenuePoint[];
  breakdown: { networkShare: number; direct: number; advisory: number };
}) {
  const pieData = [
    { name: 'Network 15%', value: Math.max(0, breakdown.networkShare) },
    { name: 'Direct', value: Math.max(0, breakdown.direct) },
    { name: 'Advisory', value: Math.max(0, breakdown.advisory) },
  ];
  const colors = ['#0ea5e9', '#22c55e', '#a78bfa'];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="network_revenue" name="Network" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="advisory_revenue" name="Advisory" stroke="#a78bfa" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="direct_referrals" name="Direct" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-72 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="h-72 w-full lg:col-span-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="network_revenue" name="Network" fill="#0ea5e9" />
            <Bar dataKey="advisory_revenue" name="Advisory" fill="#a78bfa" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


