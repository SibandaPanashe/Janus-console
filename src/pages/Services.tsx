import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Server, Plus, ArrowRight } from "lucide-react";
import { api, type Service } from "../api";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try { setServices(await api.listServices()); } catch (e) { setError((e as Error).message); }
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !url) return;
    try {
      await api.createService(name, url);
      setName(""); setUrl(""); setShowAdd(false);
      await load();
    } catch (e) { setError((e as Error).message); }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-janus-text flex items-center gap-2"><Server className="text-janus-accent" /> My APIs</h1>
          <p className="text-sm text-janus-dim mt-1">Manage your backend services and apply specific rules.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 rounded-md bg-janus-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Plus size={16} /> Add New API
        </button>
      </header>

      {error && <div className="text-janus-bad text-sm">{error}</div>}

      {showAdd && (
        <form onSubmit={handleCreate} className="rounded-lg border border-janus-line bg-janus-panel p-6 mb-6">
          <h3 className="text-sm font-semibold mb-4">Connect a new backend</h3>
          <div className="grid grid-cols-2 gap-4">
             <input value={name} onChange={e=>setName(e.target.value)} placeholder="Service Name (e.g. Billing API)" className="rounded border border-janus-line bg-black/30 px-3 py-2 text-sm text-white" />
             <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Backend URL (https://...)" className="rounded border border-janus-line bg-black/30 px-3 py-2 text-sm text-white" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-janus-dim hover:text-white">Cancel</button>
            <button type="submit" className="rounded bg-janus-accent px-4 py-2 text-sm text-white">Save Service</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => (
          <div key={svc.id} className="rounded-xl border border-janus-line bg-janus-panel p-5 hover:border-janus-accent/50 transition group cursor-pointer relative">
            <Link to={`/services/${svc.id}`} className="absolute inset-0 z-0"></Link>
            <div className="flex justify-between items-start mb-4 relative z-10 pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-janus-line flex items-center justify-center"><Server size={20} className="text-janus-text" /></div>
                <div>
                  <h3 className="font-semibold text-janus-text group-hover:text-janus-accent transition">{svc.name}</h3>
                  <p className="text-xs text-janus-dim font-mono">{svc.backendUrl}</p>
                </div>
              </div>
              <div className="h-2 w-2 rounded-full bg-janus-ok" />
            </div>
            <div className="mt-4 flex justify-end relative z-10 pointer-events-none">
                <span className="text-xs text-janus-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">Manage Rules <ArrowRight size={12} /></span>
            </div>
          </div>
        ))}
        {services.length === 0 && !showAdd && <div className="text-janus-dim text-sm col-span-2">No APIs added yet.</div>}
      </div>
    </div>
  );
}
