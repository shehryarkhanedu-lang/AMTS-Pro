import React, { createContext, useContext, useEffect, useState } from "react";
import { StrategyMode } from "@workspace/api-client-react";

interface TradingSettings {
  pair: string;
  timeframe: string;
  mode: StrategyMode;
}

interface TradingSettingsContextValue extends TradingSettings {
  setPair: (pair: string) => void;
  setTimeframe: (timeframe: string) => void;
  setMode: (mode: StrategyMode) => void;
}

const defaultSettings: TradingSettings = {
  pair: "BTC-USD",
  timeframe: "1h",
  mode: StrategyMode.BEGINNER,
};

// Migrate stale legacy values (e.g. old Binance-style "BTCUSDT", "4h").
function normalize(s: TradingSettings): TradingSettings {
  const next = { ...s };
  const legacyPairMap: Record<string, string> = {
    BTCUSDT: "BTC-USD",
    ETHUSDT: "ETH-USD",
    SOLUSDT: "SOL-USD",
    BNBUSDT: "BNB-USD",
    XRPUSDT: "XRP-USD",
  };
  if (legacyPairMap[next.pair]) next.pair = legacyPairMap[next.pair]!;
  if (next.timeframe === "4h") next.timeframe = "1d";
  return next;
}

const TradingSettingsContext = createContext<TradingSettingsContextValue | null>(null);

export function TradingSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<TradingSettings>(() => {
    const saved = localStorage.getItem("amts-settings");
    if (saved) {
      try {
        return normalize(JSON.parse(saved));
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("amts-settings", JSON.stringify(settings));
  }, [settings]);

  const value = {
    ...settings,
    setPair: (pair: string) => setSettings((s) => ({ ...s, pair })),
    setTimeframe: (timeframe: string) => setSettings((s) => ({ ...s, timeframe })),
    setMode: (mode: StrategyMode) => setSettings((s) => ({ ...s, mode })),
  };

  return (
    <TradingSettingsContext.Provider value={value}>
      {children}
    </TradingSettingsContext.Provider>
  );
}

export function useTradingSettings() {
  const context = useContext(TradingSettingsContext);
  if (!context) {
    throw new Error("useTradingSettings must be used within a TradingSettingsProvider");
  }
  return context;
}
