import { GlassCard } from "./GlassCard";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VibrationGaugeProps {
  value: number;
  maxValue?: number;
  riskLevel: "safe" | "warning" | "critical";
}

export const VibrationGauge = ({
  value,
  maxValue = 1000,
  riskLevel,
}: VibrationGaugeProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = Math.min((animatedValue / maxValue) * 100, 100);
  const rotation = (percentage / 100) * 270 - 135;

  const riskColors = {
    safe: "hsl(var(--risk-safe))",
    warning: "hsl(var(--risk-warning))",
    critical: "hsl(var(--risk-critical))",
  };

  const gaugeColor = riskColors[riskLevel];

  return (
    <GlassCard className="flex flex-col items-center justify-center p-8">
      <h3 className="text-lg font-semibold mb-6 text-muted-foreground">
        Vibration Level
      </h3>
      
      <div className="relative w-48 h-48">
        {/* Background arc */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="12"
            strokeDasharray="502.4"
            strokeDashoffset="125.6"
            strokeLinecap="round"
          />
          {/* Animated arc */}
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="12"
            strokeDasharray="502.4"
            strokeDashoffset={502.4 - (percentage / 100) * 376.8}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s ease-out, stroke 0.3s ease",
            }}
            className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        </svg>

        {/* Center display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-bold", `status-${riskLevel}`)}>
            {animatedValue.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground mt-1">units</span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <div className={cn("w-3 h-3 rounded-full animate-pulse", `bg-${riskLevel}`)} 
             style={{ backgroundColor: gaugeColor }} />
        <span className={cn("text-sm font-medium uppercase", `status-${riskLevel}`)}>
          {riskLevel}
        </span>
      </div>
    </GlassCard>
  );
};
