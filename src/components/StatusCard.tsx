import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  status?: "safe" | "warning" | "critical" | "neutral";
  className?: string;
}

export const StatusCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  status = "neutral",
  className,
}: StatusCardProps) => {
  const statusColors = {
    safe: "status-safe",
    warning: "status-warning",
    critical: "status-critical",
    neutral: "text-primary",
  };

  return (
    <GlassCard className={cn("animate-fade-in", className)} hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className={cn("text-3xl font-bold mb-1", statusColors[status])}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl glass-card", statusColors[status])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </GlassCard>
  );
};
