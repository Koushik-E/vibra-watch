import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface RiskIndicatorProps {
  prediction: string;
  confidence: number;
}

export const RiskIndicator = ({ prediction, confidence }: RiskIndicatorProps) => {
  const getRiskLevel = (pred: string): "safe" | "warning" | "critical" => {
    const lower = pred.toLowerCase();
    if (lower.includes("high")) return "critical";
    if (lower.includes("low")) return "warning";
    return "safe"; // "no vibration"
  };

  const riskLevel = getRiskLevel(prediction);

  const icons = {
    safe: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle,
  };

  const Icon = icons[riskLevel];

  const gradients = {
    safe: "var(--gradient-safe)",
    warning: "var(--gradient-warning)",
    critical: "var(--gradient-critical)",
  };

  return (
    <GlassCard className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-10 animate-pulse-glow"
        style={{
          background: gradients[riskLevel],
        }}
      />

      <div className="relative z-10">
        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
          ML Prediction
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <Icon className={cn("w-12 h-12", `status-${riskLevel}`)} />
          <div>
            <p className={cn("text-2xl font-bold uppercase", `status-${riskLevel}`)}>
              {prediction}
            </p>
            <p className="text-sm text-muted-foreground">Risk Status</p>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-semibold">{(confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500 rounded-full")}
              style={{
                width: `${confidence * 100}%`,
                background: gradients[riskLevel],
              }}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
