import { useEffect, useState } from "react";
import { api } from "../api";
import { Activity, AlertCircle, CheckCircle, DollarSign } from "lucide-react";

export default function Overview() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
    loadData();
  }, []);

  if (error) {
    return <div className="text-red-500 p-4 border border-red-500/20 bg-red-500/10 rounded">{error}</div>;
  }

  // A skeleton loader while fetching
  if (!stats) {
    return <div className="text-janus-dim animate-pulse">Loading dashboard stats...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Global Overview</h1>
        <p className="text-sm text-janus-dim mt-1">Real-time metrics for your API Gateway.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Requests Card */}
        <div className="rounded-lg border border-janus-line bg-janus-panel p-5">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-janus-dim">Total Requests</h3>
            <Activity size={16} className="text-janus-accent" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalRequests?.toLocaleString() || 0}
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="rounded-lg border border-janus-line bg-janus-panel p-5">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-janus-dim">Success Rate</h3>
            <CheckCircle size={16} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.successRate ? `${stats.successRate.toFixed(1)}%` : "100%"}
          </div>
        </div>

        {/* Error Rate Card */}
        <div className="rounded-lg border border-janus-line bg-janus-panel p-5">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-janus-dim">Error Rate</h3>
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.errorRate ? `${stats.errorRate.toFixed(1)}%` : "0%"}
          </div>
        </div>

        {/* Billing Card */}
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
    </div>
  );
}