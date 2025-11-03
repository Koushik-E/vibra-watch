import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface VibrationData {
  timestamp: string | null;
  vibration: number | null;
  pred_label: string | null;
  pred_prob: number | null;
}

interface DataPoint {
  time: string;
  value: number;
}

const BACKEND_URL = "http://localhost:5050/data";
const POLL_INTERVAL = 1000; // 1 second
const MAX_DATA_POINTS = 20;

export const useVibrationData = () => {
  const [currentData, setCurrentData] = useState<VibrationData>({
    timestamp: null,
    vibration: null,
    pred_label: null,
    pred_prob: null,
  });
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(BACKEND_URL);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data: VibrationData = await response.json();

      // Only update if we have new data
      if (data.vibration !== null && data.timestamp !== lastUpdate) {
        setCurrentData(data);
        setLastUpdate(data.timestamp);
        setIsConnected(true);

        // Add to historical data
        const newPoint: DataPoint = {
          time: new Date(data.timestamp || "").toLocaleTimeString(),
          value: data.vibration,
        };

        setHistoricalData((prev) => {
          const updated = [...prev, newPoint];
          return updated.slice(-MAX_DATA_POINTS);
        });
      } else if (data.vibration !== null) {
        // Data exists but hasn't changed
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (isConnected) {
        setIsConnected(false);
        toast({
          title: "Connection Lost",
          description: "Unable to reach vibration sensor backend",
          variant: "destructive",
        });
      }
    }
  }, [lastUpdate, isConnected, toast]);

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    currentData,
    historicalData,
    isConnected,
  };
};
