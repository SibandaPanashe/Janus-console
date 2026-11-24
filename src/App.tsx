import { NavLink, Route, Routes, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Activity, KeyRound, LogOut, Server } from "lucide-react";
import { useAuth } from "./AuthContext";
import Overview from "./pages/Overview";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Keys from "./pages/Keys";
import Login from "./pages/Login";
import clsx from "clsx";

function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const nav = [
    { to: "/",         label: "Global Overview", icon: Activity },
    { to: "/services", label: "My APIs",         icon: Server },
    { to: "/keys",     label: "API Keys",        icon: KeyRound },
  ];

  return (
    <div className="flex h-full min-h-screen bg-janus-bg font-sans">
      <aside className="w-64 shrink-0 border-r border-janus-line bg-janus-panel flex flex-col">
        <div className="p-6">
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-janus-accent flex items-center justify-center text-xs">J</div>
            Janus
          </div>
          <div className="text-xs text-janus-dim mt-1">Gateway Control Plane</div>
        </div>

        <nav className="flex-1 space-y-1 px-3 mt-4">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition font-medium",
                  isActive
                    ? "bg-janus-accent/10 text-janus-accent"
                    : "text-janus-dim hover:bg-white/5 hover:text-janus-text"
                )
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-janus-line space-y-4">
           <button onClick={() => { logout(); navigate("/login"); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-janus-dim hover:bg-janus-bad/10 hover:text-janus-bad transition">
             <LogOut size={16} /> Sign out
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-[#0b0e14]">
        <div className="mx-auto max-w-6xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function ProtectedRoute() {
  const { apiKey } = useAuth();
  if (!apiKey) return <Navigate to="/login" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Overview />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/keys" element={<Keys />} />
      </Route>
    </Routes>
  );
}
