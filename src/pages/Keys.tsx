import { useEffect, useState } from "react";
import { api } from "../api";
import { KeyRound, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useToast } from "../components/ToastContext";

export default function Keys() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [plan, setPlan] = useState("free"); // Added state for the plan
  const { showToast } = useToast();

  const loadKeys = async () => {
    try {
      setLoading(true);
      const data = await api.listKeys();
      setKeys(Array.isArray(data) ? data : data.keys || []);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreate = async () => {
    try {
      setCreating(true);
      // Use the selected plan instead of hardcoding "free"
      const res = await api.createKey(plan);
      setNewKey(res.rawKey || res.apiKey || res.maskedKey || "Key generated (check backend logs)");
      showToast("API Key generated successfully!");
      await loadKeys();
    } catch (err: any) {
      showToast("Failed to create key: " + err.message, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm("Are you sure you want to permanently revoke this key? Any apps using it will stop working immediately.")) return;
    
    try {
      await api.deleteKey(clientId);
      showToast("Key revoked successfully.");
      await loadKeys();
    } catch (err: any) {
      showToast("Failed to revoke key: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">API Keys</h1>
          <p className="text-sm text-janus-dim mt-1">Manage keys to authenticate against the Janus Gateway.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={plan} 
            onChange={(e) => setPlan(e.target.value)}
            className="rounded-md border border-janus-line bg-janus-panel px-3 py-2 text-sm text-white focus:outline-none focus:border-janus-accent"
          >
            <option value="free">Free (10 req/s)</option>
            <option value="pro">Pro (100 req/s)</option>
          </select>

          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 rounded-md bg-janus-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition"
          >
            <Plus size={16} /> {creating ? "Generating..." : "Generate New Key"}
          </button>
        </div>
      </div>

      {newKey && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
            <ShieldCheck size={18} /> Key Generated Successfully!
          </div>
          <p className="text-sm text-green-100/70 mb-3">
            Please copy this key and store it securely. You will not be able to see it again.
          </p>
          <code className="block w-full rounded bg-black/50 p-3 text-sm font-mono text-green-300 select-all">
            {newKey}
          </code>
          <button onClick={() => setNewKey(null)} className="mt-3 text-xs text-green-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {error && <div className="text-red-500">{error}</div>}

      {loading ? (
        <div className="text-janus-dim animate-pulse">Loading API keys...</div>
      ) : keys.length === 0 ? (
        <div className="rounded-lg border border-janus-line bg-janus-panel p-8 text-center">
          <KeyRound size={32} className="mx-auto text-janus-dim mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">No API Keys yet</h3>
          <p className="text-sm text-janus-dim">Generate a key to start routing traffic through Janus.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-janus-line bg-janus-panel overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-janus-line text-janus-dim">
              <tr>
                <th className="px-4 py-3 font-medium">Key</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-janus-line text-janus-text">
              {keys.map((k: any, i) => (
                <tr key={k.id || i} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-janus-accent">{k.maskedKey || k.key || k.prefix || "sk-..."}</td>
                  <td className="px-4 py-3 uppercase text-xs font-semibold">{k.plan || "FREE"}</td>
                  <td className="px-4 py-3 text-janus-dim">
                    {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "Just now"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleDelete(k.clientId)}
                      className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-medium hover:underline transition"
                    >
                      <Trash2 size={14} /> Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}