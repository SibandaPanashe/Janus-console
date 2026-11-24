import { useEffect, useState } from "react";
import { api } from "../api";
import { Activity, AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Overview() {
  const [stats, setStats] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, usageData] = await Promise.all([
          api.getDashboardStats(),
          api.getDashboardUsage()
        ]);
        setStats(statsData);
        // Ensure we handle both { usage: [...] } and [...] shapes
        setUsage(Array.isArray(usageData) ? usageData : usageData.usage || []);
      } catch (err: any) {
        setError(err.message);
      }
    }
    loadData();
  }, []);

  if (error) {
    return <div className="text-red-500 p-4 border border-red-500/20 bg-red-500/10 rounded">{error}</div>;
  }

  if (!stats) {
    return <div className="text-janus-dim animate-pulse">Loading dashboard stats...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Global Overview</h1>
        <p className="text-sm text-janus-dim mt-1">Real-time metrics for your API Gateway.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-janus-line bg-janus-panel p-5">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-janus-dim">Total Requests</h3>
            <Activity size={16} className="text-janus-accent" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalRequests?.toLocaleString() || 0}
          </div>
        </div>

        <div className="rounded-lg border border-janus-line bg-janus-panel p-5">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-janus-dim">Success Rate</h3>
            <CheckCircle size={16} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.successRate ? `${stats.successRate.toFixed(1)}%` : "100%"}
          </div>
        </div>

        <div className="rounded-lg border border-janus-line bg-janus-panel p-5">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-janus-dim">Error Rate</h3>
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.errorRate ? `${stats.errorRate.toFixed(1)}%` : "0%"}
          </div>
        </div>

        <div className="rounded-lg border border-janus-line bg-janus-panel p-5">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-janus-dim">Est. Cost (Month)</h3>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats.estimatedCost?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>

      {/* Traffic Chart */}
      <div className="rounded-lg border border-janus-line bg-janus-panel p-6">
        <h3 className="text-sm font-medium text-janus-dim mb-4">Traffic Volume (Last 24 Hours)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usage.length > 0 ? usage : [{ time: '00:00', requests: 0 }, { time: '12:00', requests: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a24', borderColor: '#2a2a35', borderRadius: '8px' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}