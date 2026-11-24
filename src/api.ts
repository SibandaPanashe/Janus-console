// src/api.ts

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const apiKey = localStorage.getItem("janus_api_key");
  
  const headers = {
    "Content-Type": "application/json",
    // The ServiceController requires X-Client-Id. 
    // For the demo, we use the API key as the client ID.
    "X-Client-Id": apiKey || "demo-client", 
    ...(apiKey ? { "X-API-Key": apiKey, "Authorization": `Bearer ${apiKey}` } : {}), 
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Please check your API key.");
    }
    if (response.status === 400) {
      throw new Error("Bad Request: Missing required data or headers.");
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) return null;
  
  return response.json();
}

export const api = {
  // --- Services APIs ---
  listServices: () => fetchWithAuth("/admin/services"),
  createService: (name: string, url: string) => 
    fetchWithAuth("/admin/services", { method: "POST", body: JSON.stringify({ name, url }) }),

  // --- Rules APIs ---
  listRules: (serviceId: string) => fetchWithAuth(`/admin/rules?serviceId=${serviceId}`),
  toggleRule: (ruleId: string) => fetchWithAuth(`/admin/rules/${ruleId}/toggle`, { method: "PATCH" }),
  reloadRules: () => fetchWithAuth("/admin/rules/reload", { method: "POST" }),

  // --- Dashboard Overview APIs ---s
  getDashboardStats: () => fetchWithAuth("/api/dashboard/stats"),
  getDashboardUsage: () => fetchWithAuth("/api/dashboard/usage"),
  getDashboardEndpoints: () => fetchWithAuth("/api/dashboard/endpoints"),

  // --- API Keys APIs ---
  listKeys: () => fetchWithAuth("/admin/keys"),
  createKey: (plan: string) => fetchWithAuth("/admin/keys", { method: "POST", body: JSON.stringify({ plan }) }),
};