import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const ALL = ["MAKER", "CHECKER", "ADMIN", "SUPERUSER"];

  const menuItems = [
    {
      name: "Maker Initiation",
      path: "/transfers/maker",
      allowed: ["MAKER", "SUPERUSER"],
    },
    {
      name: "Checker Auth",
      path: "/transfers/checker",
      allowed: ["CHECKER", "SUPERUSER"],
    },
    { name: "User Management", path: "/admin/users", allowed: ["SUPERUSER"] },
    { name: "Group Master", path: "/admin/groups", allowed: ["SUPERUSER"] },
    { name: "Vouchers", path: "/vouchers", allowed: ALL },
  ];

  const visibleMenu = menuItems.filter((item) =>
    item.allowed.includes(user?.role),
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-lg font-bold">Agency Portal</h1>
          <p className="text-xs text-slate-400 mt-1">{user?.name}</p>
          <span className="px-2 py-1 bg-slate-800 text-[10px] font-mono rounded text-emerald-400 mt-2 block w-max">
            {user?.role}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {visibleMenu.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-4 py-2.5 rounded text-sm ${location.pathname === item.path ? "bg-emerald-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800"}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
export default Layout;
