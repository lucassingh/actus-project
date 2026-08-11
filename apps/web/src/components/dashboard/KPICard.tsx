import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  gradient: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, iconColor, gradient }: KPICardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: gradient }}
      >
        <Icon size={24} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
