'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function SelectNetworkCharts({
  monthlyReferrals,
}: {
  monthlyReferrals: { month: string; referrals: number }[];
}) {
  return (
    <Card>
      <CardHeader><CardTitle>Monthly Referrals (last 6 months)</CardTitle></CardHeader>
      <CardContent style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyReferrals} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="referrals" name="Referrals" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


