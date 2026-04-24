import { useTradingSettings } from "@/components/trading-settings-context";
import { useGetAllSignals, getGetAllSignalsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SignalBadge } from "@/components/signal-badge";
import { ConfidenceGauge } from "@/components/confidence-gauge";
import { Badge } from "@/components/ui/badge";

export default function Signals() {
  const { pair, timeframe } = useTradingSettings();
  
  const { data: signals, isLoading } = useGetAllSignals(
    { pair, timeframe },
    { query: { refetchInterval: 30000, queryKey: getGetAllSignalsQueryKey({ pair, timeframe }) } }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Multi-Signal Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Current signals across all active strategies for {pair} ({timeframe})
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : signals && signals.length > 0 ? (
        <div className="grid gap-4">
          {signals.map((signal) => (
            <Card key={signal.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-4 md:w-64 border-b md:border-b-0 md:border-r bg-secondary/20 flex flex-col justify-center">
                  <div className="text-xs text-muted-foreground font-mono mb-1">{signal.category}</div>
                  <div className="font-bold">{signal.strategyName}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <SignalBadge signal={signal.signal} />
                    <ConfidenceGauge confidence={signal.confidence} size="sm" />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-center">
                  <p className="text-sm text-foreground/90">{signal.rationale}</p>
                  
                  {(signal.entry > 0 || signal.stopLoss > 0) && (
                    <div className="mt-4 flex gap-6 text-xs font-mono">
                      {signal.entry > 0 && (
                        <div><span className="text-muted-foreground mr-2">ENTRY</span> {signal.entry}</div>
                      )}
                      {signal.takeProfit > 0 && (
                        <div><span className="text-muted-foreground mr-2">TP</span> <span className="text-buy">{signal.takeProfit}</span></div>
                      )}
                      {signal.stopLoss > 0 && (
                        <div><span className="text-muted-foreground mr-2">SL</span> <span className="text-sell">{signal.stopLoss}</span></div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-secondary/10">
          No active signals found for this pair and timeframe.
        </div>
      )}
    </div>
  );
}
