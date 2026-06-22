import React from "react";
import { Link, useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();

  // These paths match the Routes we defined in App.jsx
  const menuItems = [
    { name: "Maker Initiation", path: "/transfers/maker" },
    { name: "Checker Auth", path: "/transfers/checker" },
    { name: "Vouchers", path: "/vouchers" },
    { name: "Statements", path: "/statements" },
    { name: "Commissions", path: "/commissions" },
    { name: "Profile Update", path: "/profile" },
    { name: "Offline Sync", path: "/sync" },
  ];

  return (
    <div className="flex h-screen bg-fintech-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-fintech-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-fintech-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-fintech-600 rounded flex items-center justify-center font-bold text-lg shadow-sm">
              P
            </div>
            <h1 className="text-lg font-bold tracking-wide">Agency Portal</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-fintech-600 text-white font-medium shadow-sm"
                    : "text-slate-300 hover:bg-fintech-800 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer of the sidebar */}
        <div className="p-4 border-t border-fintech-800 text-xs text-slate-400 text-center leading-relaxed">
          Intellect Design Arena <br />
          Internship Build
        </div>
      </aside>

      {/* Main Content Area (Where the other components load) */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
