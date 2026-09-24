"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCircle,
  AlertCircle,
  FileText,
  BookOpen,
  LifeBuoy,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "ADMIN" | "SUPERVISOR" | "OPERATOR";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
  subItems?: { label: string; path: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", path: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SUPERVISOR"] },
  {
    label: "Empresas",
    path: "/dashboard/tenants",
    icon: Building2,
    roles: ["ADMIN"],
    subItems: [
      { label: "Listado", path: "/dashboard/tenants" },
      { label: "Nueva empresa", path: "/dashboard/tenants/create" },
    ],
  },
  {
    label: "Supervisores",
    path: "/dashboard/supervisors",
    icon: Users,
    roles: ["ADMIN"],
    subItems: [
      { label: "Listado", path: "/dashboard/supervisors" },
      { label: "Invitar supervisor", path: "/dashboard/supervisors/create" },
    ],
  },
  {
    label: "Operadores",
    path: "/dashboard/operators",
    icon: UserCircle,
    roles: ["SUPERVISOR"],
    subItems: [
      { label: "Listado", path: "/dashboard/operators" },
      { label: "Nuevo operador", path: "/dashboard/operators/create" },
    ],
  },
  { label: "Eventos", path: "/dashboard/events", icon: AlertCircle, roles: ["SUPERVISOR"] },
  { label: "Documentos", path: "/dashboard/factory-docs", icon: FileText, roles: ["SUPERVISOR"] },
  { label: "Base de conocimiento", path: "/dashboard/knowledge-base", icon: BookOpen, roles: ["SUPERVISOR", "ADMIN"] },
];

const SEGMENT_LABELS: Record<string, string> = {
  tenants: "Empresas",
  supervisors: "Supervisores",
  operators: "Operadores",
  events: "Eventos",
  "factory-docs": "Documentos",
  "knowledge-base": "Base de conocimiento",
  create: "Nuevo",
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  OPERATOR: "Operador",
};

export interface ShellUser {
  role: Role;
  displayName: string;
  workspace: string;
  /** Company logo (Clerk org image) or the Actus isologo for platform admins. */
  workspaceLogo: string | null;
}

export function DashboardShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-fg">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-line bg-white transition-[width] duration-200 ease-[var(--ease-out-expo)] lg:flex lg:flex-col",
          collapsed ? "w-[64px]" : "w-[248px]"
        )}
      >
        <SidebarContent user={user} pathname={pathname} collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[var(--z-overlay)] lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-fg/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[272px] flex-col border-r border-line bg-white">
            <SidebarContent user={user} pathname={pathname} collapsed={false} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-4 lg:px-6">
          <button
            type="button"
            className="-ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-[#F1F1F4] lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
            aria-expanded={!collapsed}
            className="-ml-1 hidden h-8 w-8 items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-[#F1F1F4] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:inline-flex"
          >
            {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.75} /> : <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          </button>
          <span aria-hidden="true" className="hidden h-5 w-px bg-line lg:block" />
          <Breadcrumb pathname={pathname} />
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-[13px] font-medium text-fg">{user.displayName}</p>
              <p className="text-xs text-fg-subtle">{ROLE_LABELS[user.role]}</p>
            </div>
            <UserButton
              appearance={{
                elements: { avatarBox: "h-8 w-8 ring-1 ring-line" },
              }}
            />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  user,
  pathname,
  collapsed,
}: {
  user: ShellUser;
  pathname: string;
  collapsed: boolean;
}) {
  const { signOut } = useClerk();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const isActive = (path: string) =>
    path === "/dashboard" ? pathname === path : pathname === path || pathname.startsWith(path + "/");

  return (
    <>
      <div className={cn("flex h-14 shrink-0 items-center border-b border-line", collapsed ? "justify-center" : "px-4")}>
        <Link href="/dashboard" className="flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {collapsed ? (
            <Image src="/logos/isologo-light.svg" alt="Actus" width={24} height={24} className="h-6 w-6" />
          ) : (
            <Image src="/logos/logo-bg-white.svg" alt="Actus" width={86} height={28} className="h-7 w-auto" priority />
          )}
        </Link>
      </div>

      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2.5 rounded-md border border-line px-2.5 py-2">
            {user.workspaceLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.workspaceLogo} alt="" className="h-7 w-7 shrink-0 rounded-md border border-line bg-white object-contain p-0.5" />
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-white">
                {user.workspace[0]?.toUpperCase() ?? "A"}
              </span>
            )}
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-medium text-fg">{user.workspace}</p>
              <p className="text-[11px] text-fg-subtle">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        </div>
      )}

      <nav aria-label="Secciones" className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            const showSub = !collapsed && active && !!item.subItems?.length;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  title={collapsed ? item.label : undefined}
                  aria-current={active && pathname === item.path ? "page" : undefined}
                  className={cn(
                    "group flex h-8 items-center gap-2.5 rounded-md text-[13px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                    collapsed ? "justify-center" : "px-2.5",
                    active ? "bg-[#F1F1F4] font-medium text-fg" : "text-fg-muted hover:bg-[#F6F6F8] hover:text-fg"
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-fg-subtle group-hover:text-fg-muted")}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
                {showSub && (
                  <ul className="ml-[18px] mt-0.5 flex flex-col gap-0.5 border-l border-line pl-2.5">
                    {item.subItems!.map((sub) => {
                      const subActive = pathname === sub.path;
                      return (
                        <li key={sub.path}>
                          <Link
                            href={sub.path}
                            aria-current={subActive ? "page" : undefined}
                            className={cn(
                              "flex h-7 items-center rounded-md px-2 text-[13px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary",
                              subActive ? "font-medium text-fg" : "text-fg-subtle hover:text-fg"
                            )}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: support (animated brand gradient), 10px, hairline, 10px, sign-out */}
      <div className={cn("flex shrink-0 flex-col gap-2.5 p-2.5", collapsed && "items-center")}>
        <a
          href="mailto:soporte@actus-ia.com"
          title={collapsed ? "Soporte" : undefined}
          aria-label={collapsed ? "Soporte" : undefined}
          className={cn(
            "support-gradient relative isolate inline-flex h-9 items-center justify-center gap-2 overflow-hidden rounded-md text-[13px] font-medium text-white transition-transform duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            collapsed ? "w-9" : "w-full"
          )}
        >
          <LifeBuoy className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          {!collapsed && "Soporte"}
        </a>
        <hr className="-mx-2.5 w-[calc(100%+1.25rem)] self-stretch border-line" />
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          title={collapsed ? "Cerrar sesión" : undefined}
          aria-label={collapsed ? "Cerrar sesión" : undefined}
          className={cn(
            "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary text-[13px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-primary-light active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            collapsed ? "w-9" : "w-full"
          )}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
    </>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean).slice(1); // drop "dashboard"
  const crumbs = [{ label: "Inicio", href: "/dashboard" }];
  let href = "/dashboard";
  for (const seg of segments) {
    href += `/${seg}`;
    crumbs.push({ label: SEGMENT_LABELS[seg] ?? (/^\d+$/.test(seg) ? `#${seg}` : seg), href });
  }

  return (
    <nav aria-label="Ubicación" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-[13px]">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.href} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#B5B8C6]" aria-hidden="true" />}
              {last ? (
                <span aria-current="page" className="truncate font-medium text-fg">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="truncate text-fg-subtle transition-colors hover:text-fg">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

