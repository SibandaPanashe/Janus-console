import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Shield, Play, Loader2 } from "lucide-react";
import clsx from "clsx";
import { api, type Rule, type Service } from "../api";
import { useToast } from "../components/ToastContext";

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [sandboxResults, setSandboxResults] = useState<number[] | null>(null);
  const [sandboxKey, setSandboxKey] = useState("");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  async function load() {
    try {
      const svcs = await api.listServices();
      const current = svcs.find(s => s.id === id);
      if (current) setService(current);
      
      try {
        const r = await api.listRules(id!);
        setRules(r);
      } catch (e) {
        console.warn("Could not load rules:", e);
      }
    } catch (e) { setError((e as Error).message); }
  }
  
  useEffect(() => { load(); }, [id]);

  async function toggleRule(rule: Rule) {
    try {
      const res = await api.toggleRule(rule.id);
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: res.active } : r));
      await api.reloadRules();
      setSandboxResults(null);
      showToast("Rule updated and rules engine reloaded");
    } catch (e) { 
      setError((e as Error).message); 
      showToast("Failed to toggle rule", "error");
    }
  }

  async function runSandbox() {
    if (!sandboxKey) {
      showToast("Please paste a valid API Key from the API Keys tab.", "error");
      return;
    }

    setSandboxRunning(true);
    setSandboxResults(null);
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    
    const calls = Array.from({ length: 15 }, () =>
      fetch(`${baseUrl}/api/v1/proxy`, { 
        headers: { "X-API-Key": sandboxKey } 
      })
      .then(r => r.status)
      .catch(() => 0)
    );
    
    const out = await Promise.all(calls);
    setSandboxResults(out);
    setSandboxRunning(false);
    showToast("Sandbox simulation complete!");
  }

  if (!service) return <div className="text-janus-dim p-8">Loading service details...</div>;

  return (
    <div className="space-y-6">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm text-janus-dim hover:text-white transition">
        <ArrowLeft size={16} /> Back to APIs
      </Link>
      
      <header className="flex items-end justify-between border-b border-janus-line pb-6">
        <div>
          <h1 className="text-2xl font-bold text-janus-text">{service.name}</h1> 
          <p className="text-sm text-janus-dim font-mono mt-1">{service.backendUrl}</p>
        </div>
      </header>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-janus-dim">Business Rules</h2>
          
          {rules.map((rule) => (
             <div key={rule.id} className={clsx("rounded-xl border bg-janus-panel overflow-hidden transition-all", rule.active ? "border-janus-accent/40 shadow-[0_0_15px_rgba(59,130,246,0.05)]" : "border-janus-line opacity-70")}>
                <div className="flex items-center justify-between bg-white/[0.02] px-4 py-3 border-b border-janus-line/50">
                   <div className="flex items-center gap-3">
                      <Shield size={16} className={rule.active ? "text-janus-accent" : "text-janus-dim"} />
                      <span className="font-semibold text-sm text-white">{rule.name}</span> 
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-xs text-janus-dim">P{rule.priority}</span>
                     <button onClick={() => toggleRule(rule)} className={clsx("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", rule.active ? "bg-janus-accent" : "bg-janus-line")}>
                        <span className={clsx("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition", rule.active ? "translate-x-4" : "translate-x-0")} />
                     </button>
                   </div>
                </div>
                <div className="p-4 flex gap-4">
                   <p className="text-sm text-janus-dim">{rule.description || "No description provided."}</p> 
                </div>
             </div>
          ))}
          {rules.length === 0 && (
            <div className="rounded-lg border border-janus-line bg-janus-panel p-8 text-center">
              <Shield size={32} className="mx-auto text-janus-dim mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">No custom rules</h3>
              <p className="text-sm text-janus-dim">This API is currently using the global default rules.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-janus-line bg-janus-panel p-5 sticky top-8">
            <h2 className="text-sm font-semibold mb-1 text-white">API Sandbox</h2>
            <p className="text-xs text-janus-dim mb-4">Fire 15 concurrent requests to test rate limits and active rules.</p>
            
            <input 
              type="password"
              placeholder="Paste sk-... key here"
              value={sandboxKey}
              onChange={(e) => setSandboxKey(e.target.value)}
              className="w-full rounded-md border border-janus-line bg-black/30 px-3 py-2 text-sm text-white mb-2 focus:outline-none focus:border-janus-accent"
            />

            <button 
              onClick={runSandbox} 
              disabled={sandboxRunning || !sandboxKey} 
              className="w-full flex items-center justify-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-bold hover:bg-gray-200 transition disabled:opacity-50"
            >
               {sandboxRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} 
               {sandboxRunning ? "Firing..." : "Fire 15 Requests"}
            </button>
            
            {sandboxResults && (
              <div className="mt-4">
                <p className="text-xs text-janus-dim mb-2 font-medium">Results (Status Codes):</p>
                <div className="flex flex-wrap gap-1.5">
                  {sandboxResults.map((code, i) => (
                     <span 
                       key={i} 
                       className={clsx(
                         "px-2 py-1 rounded text-xs font-bold font-mono", 
                         code === 200 ? "bg-green-500/20 text-green-400" : 
                         code === 429 ? "bg-orange-500/20 text-orange-400" : 
                         "bg-red-500/20 text-red-400"
                       )}
                     >
                       {code === 0 ? "ERR" : code}
                     </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
