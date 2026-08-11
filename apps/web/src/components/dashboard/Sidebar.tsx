"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCircle,
  AlertCircle,
  FileText,
  BookOpen,
  ChevronRight,
  Headphones,
  Power,
  ChevronLeft,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  subItems?: { label: string; path: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    roles: ["ADMIN", "SUPERVISOR"],
  },
  {
    label: "Empresas",
    path: "/dashboard/tenants",
    icon: <Building2 size={20} />,
    roles: ["ADMIN"],
    subItems: [
      { label: "Listado", path: "/dashboard/tenants" },
      { label: "Nueva empresa", path: "/dashboard/tenants/create" },
    ],
  },
  {
    label: "Supervisores",
    path: "/dashboard/supervisors",
    icon: <Users size={20} />,
    roles: ["ADMIN"],
    subItems: [
      { label: "Listado", path: "/dashboard/supervisors" },
      { label: "Nuevo supervisor", path: "/dashboard/supervisors/create" },
    ],
  },
  {
    label: "Operadores",
    path: "/dashboard/operators",
    icon: <UserCircle size={20} />,
    roles: ["SUPERVISOR"],
    subItems: [
      { label: "Listado", path: "/dashboard/operators" },
      { label: "Nuevo operador", path: "/dashboard/operators/create" },
    ],
  },
  {
    label: "Eventos",
    path: "/dashboard/events",
    icon: <AlertCircle size={20} />,
    roles: ["SUPERVISOR"],
  },
  {
    label: "Documentos",
    path: "/dashboard/factory-docs",
    icon: <FileText size={20} />,
    roles: ["SUPERVISOR"],
  },
  {
    label: "Base de Conocimiento",
    path: "/dashboard/knowledge-base",
    icon: <BookOpen size={20} />,
    roles: ["SUPERVISOR", "ADMIN"],
  },
];

interface SidebarProps {
  userRole: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const toggleExpand = (path: string) =>
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));

  return (
    <aside
      className="sidebar-transition flex flex-col h-screen bg-white border-r border-gray-100 shadow-sm flex-shrink-0"
      style={{ width: collapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)" }}
    >
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
        {!collapsed && (
          <span className="text-xl font-bold" style={{ color: "var(--primary)" }}>
            Actus
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const active = isActive(item.path);
          const hasSubItems = !!item.subItems?.length;
          const isExpanded = expanded[item.path] ?? false;

          return (
            <div key={item.path}>
              {hasSubItems && !collapsed ? (
                <button
                  onClick={() => toggleExpand(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  style={active ? { backgroundColor: "var(--primary)" } : {}}
                >
                  <span style={active ? { color: "white" } : { color: "var(--primary)" }}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight
                        size={14}
                        className="transition-transform"
                        style={{ transform: isExpanded ? "rotate(90deg)" : "none" }}
                      />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } ${collapsed ? "justify-center" : ""}`}
                  style={active ? { backgroundColor: "var(--primary)" } : {}}
                  title={collapsed ? item.label : undefined}
                >
                  <span style={active ? { color: "white" } : { color: "var(--primary)" }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )}

              {/* Sub-items */}
              {hasSubItems && !collapsed && isExpanded && (
                <div className="ml-4 mt-0.5 pl-4 border-l-2 border-gray-100 space-y-0.5">
                  {item.subItems!.map((sub) => {
                    const subActive = pathname === sub.path;
                    return (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                          subActive
                            ? "font-semibold"
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                        style={subActive ? { color: "var(--secondary)", fontWeight: 600 } : {}}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Support box */}
      <div className="px-2 mb-2">
        {collapsed ? (
          <div
            className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
          >
            <Headphones size={18} />
          </div>
        ) : (
          <div
            className="p-3 rounded-xl text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
          >
            <Headphones size={18} />
            <span className="text-sm font-medium">Soporte</span>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="p-2 border-t border-gray-100">
        {collapsed ? (
          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center border transition-colors hover:text-white"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            <Power size={16} />
          </button>
        ) : (
          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all hover:text-white"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
          >
            <Power size={16} />
            Cerrar sesión
          </button>
        )}
      </div>
    </aside>
  );
}
