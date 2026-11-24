import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Shield, Play, Loader2 } from "lucide-react";
import clsx from "clsx";
import { api, type Rule, type Service } from "../api";

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [sandboxResults, setSandboxResults] = useState<number[] | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const svcs = await api.listServices();
      const current = svcs.find(s => s.id === id);
      if (current) setService(current);
      
      const r = await api.listRules(id);
      setRules(r);
    } catch (e) { setError((e as Error).message); }
  }
  
  useEffect(() => { load(); }, [id]);

  async function toggleRule(rule: Rule) {
    try {
      const res = await api.toggleRule(rule.id);
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: res.active } : r));
      await api.reloadRules();
      setSandboxResults(null);
    } catch (e) { setError((e as Error).message); }
  }

  async function runSandbox() {
    setSandboxRunning(true);
    setSandboxResults(null);
    const apiKey = sessionStorage.getItem("janus_key") || "";
    const calls = Array.from({ length: 15 }, () =>
      fetch("/api/v1/proxy", { headers: { "X-API-Key": apiKey } }).then(r => r.status).catch(() => 0)
    );
    const out = await Promise.all(calls);
    setSandboxResults(out);
    setSandboxRunning(false);
  }

  if (!service) return <div className="text-janus-dim">Loading...</div>;

  return (
    <div className="space-y-6">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm text-janus-dim hover:text-white"><ArrowLeft size={16} /> Back to APIs</Link>
      
      <header className="flex items-end justify-between border-b border-janus-line pb-6">
        <div>
          <h1 className="text-2xl font-bold text-janus-text">{service.name}</h1> 
          <p className="text-sm text-janus-dim font-mono mt-1">{service.backendUrl}</p>
        </div>
      </header>

      {error && <div className="text-janus-bad text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-janus-dim">Business Rules</h2>
          
          {rules.map((rule) => (
             <div key={rule.id} className={clsx("rounded-xl border bg-janus-panel overflow-hidden transition-all", rule.active ? "border-janus-accent/40 shadow-[0_0_15px_rgba(59,130,246,0.05)]" : "border-janus-line opacity-70")}>
                <div className="flex items-center justify-between bg-white/[0.02] px-4 py-3 border-b border-janus-line/50">
                   <div className="flex items-center gap-3">
                      <Shield size={16} className={rule.active ? "text-janus-accent" : "text-janus-dim"} />
                      <span className="font-semibold text-sm">{rule.name}</span> 
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-xs text-janus-dim">P{rule.priority}</span>
                     <button onClick={() => toggleRule(rule)} className={clsx("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", rule.active ? "bg-janus-accent" : "bg-janus-line")}>
                        <span className={clsx("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition", rule.active ? "translate-x-4" : "translate-x-0")} />
                     </button>
                   </div>
                </div>
                <div className="p-4 flex gap-4">
                   <p className="text-sm text-janus-text">{rule.description}</p> 
                </div>
             </div>
          ))}
          {rules.length === 0 && <div className="text-janus-dim text-sm">No specific rules active for this API. Using global defaults.</div>}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-janus-line bg-janus-panel p-5 sticky top-8">
            <h2 className="text-sm font-semibold mb-1">API Sandbox</h2>
            <p className="text-xs text-janus-dim mb-4">Test active rules on this service.</p>
            <button onClick={runSandbox} disabled={sandboxRunning} className="w-full flex items-center justify-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-bold hover:bg-gray-200">
               {sandboxRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Fire 15 Requests
            </button>
            {sandboxResults && (
              <div className="mt-4 flex flex-wrap gap-1">
                {sandboxResults.map((code, i) => (
                   <span key={i} className={clsx("px-2 py-1 rounded text-xs font-bold", code === 200 ? "bg-janus-ok/20 text-janus-ok" : "bg-janus-bad/20 text-janus-bad")}>{code}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
