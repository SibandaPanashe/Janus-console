import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [key, setKey] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    login(key.trim());
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-janus-bg">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-janus-line bg-janus-panel p-6 space-y-4">
        <h1 className="text-lg font-bold text-white">Janus Console</h1>
        <p className="text-xs text-janus-dim">Enter your API key to continue.</p>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-..."
          className="w-full rounded-md border border-janus-line bg-janus-bg px-3 py-2 text-sm text-janus-text outline-none focus:border-janus-accent"
        />
        <button type="submit" className="w-full rounded-md bg-janus-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90">
          Continue
        </button>
      </form>
    </div>
  );
}
