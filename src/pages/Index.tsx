import { Activity, Wifi, WifiOff, Clock, TrendingUp } from "lucide-react";
import { StatusCard } from "@/components/StatusCard";
import { VibrationGauge } from "@/components/VibrationGauge";
import { VibrationChart } from "@/components/VibrationChart";
import { RiskIndicator } from "@/components/RiskIndicator";
import { useVibrationData } from "@/hooks/useVibrationData";
import vibrasenseLogo from "@/assets/vibrasense-logo.png";

const Index = () => {
  const { currentData, historicalData, isConnected } = useVibrationData();

  const getRiskLevel = (pred: string | null): "safe" | "warning" | "critical" => {
    if (!pred) return "safe";
    const lower = pred.toLowerCase();
    if (lower.includes("high")) return "critical";
    if (lower.includes("low")) return "warning";
    return "safe"; // "no vibration"
  };

  const riskLevel = getRiskLevel(currentData.pred_label);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8 animate-fade-in relative">
        <img 
          src={vibrasenseLogo} 
          alt="Vibrasense Logo" 
          className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover opacity-90 hover:opacity-100 transition-opacity"
          style={{ filter: 'brightness(1.2) saturate(0.8)' }}
        />
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-10 h-10 text-primary" />
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient">
            VIBRASENSE
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Real-time Structural Health Monitoring System
        </p>
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Connection Status */}
        <StatusCard
          title="Connection Status"
          value={isConnected ? "Online" : "Offline"}
          subtitle={isConnected ? "Receiving data" : "No signal"}
          icon={isConnected ? Wifi : WifiOff}
          status={isConnected ? "safe" : "critical"}
        />

        {/* Current Vibration */}
        <StatusCard
          title="Current Vibration"
          value={currentData.vibration?.toFixed(2) || "—"}
          subtitle="Sensor units"
          icon={TrendingUp}
          status={riskLevel}
        />

        {/* Last Update */}
        <StatusCard
          title="Last Update"
          value={
            currentData.timestamp
              ? new Date(currentData.timestamp).toLocaleTimeString()
              : "—"
          }
          subtitle={
            currentData.timestamp
              ? new Date(currentData.timestamp).toLocaleDateString()
              : "Waiting for data"
          }
          icon={Clock}
          status="neutral"
        />
      </div>

      {/* Gauge and Risk Indicator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <VibrationGauge
          value={currentData.vibration || 0}
          maxValue={1000}
          riskLevel={riskLevel}
        />

        {currentData.pred_label && currentData.pred_prob !== null && (
          <RiskIndicator
            prediction={currentData.pred_label}
            confidence={currentData.pred_prob}
          />
        )}
      </div>

      {/* Timeline Chart */}
      {historicalData.length > 0 && (
        <div className="animate-fade-in">
          <VibrationChart data={historicalData} />
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Bridge monitoring powered by ML • Data refreshes every second •{" "}
          {historicalData.length} data points collected
        </p>
      </footer>
    </div>
  );
};

export default Index;
