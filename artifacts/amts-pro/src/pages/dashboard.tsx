import { useTradingSettings } from "@/components/trading-settings-context";
import {
  useGetDashboardSummary,
  useGetCandles,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SignalBadge } from "@/components/signal-badge";
import { ConfidenceGauge } from "@/components/confidence-gauge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const { pair, timeframe, mode } = useTradingSettings();
  
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary(
    { pair, timeframe },
    { query: { refetchInterval: 30000, queryKey: getGetDashboardSummaryQueryKey({ pair, timeframe }) } }
  );

  const { data: candles, isLoading: isLoadingCandles } = useGetCandles(
    { pair, timeframe, limit: 100 }
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Ticker */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pair}</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            {timeframe} timeframe
          </p>
        </div>
        {isLoadingSummary ? (
          <Skeleton className="w-32 h-10" />
        ) : summary?.ticker ? (
          <div className="text-right">
            <div className="text-2xl font-mono tracking-tight">
              ${summary.ticker.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </div>
            <div className={`text-sm font-mono ${summary.ticker.changePercent24h >= 0 ? "text-buy" : "text-sell"}`}>
              {summary.ticker.changePercent24h >= 0 ? "+" : ""}{summary.ticker.changePercent24h.toFixed(2)}%
            </div>
          </div>
        ) : null}
      </div>

      {summary?.conflict?.hasConflict && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md flex items-center justify-between animate-in fade-in">
          <div>
            <h4 className="font-bold text-sm">Signal Conflict Warning</h4>
            <p className="text-xs opacity-90">{summary.conflict.message}</p>
          </div>
          <SignalBadge signal={summary.conflict.dominant} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Signal Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                Top Signal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : summary?.top ? (
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <SignalBadge signal={summary.top.signal} className="text-lg px-4 py-1" />
                      <span className="font-bold">{summary.top.strategyName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                      {summary.top.rationale}
                    </p>
                    
                    {(summary.top.entry > 0 || summary.top.stopLoss > 0) && (
                      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border/50">
                        <div>
                          <div className="text-[10px] uppercase text-muted-foreground mb-1">Entry</div>
                          <div className="font-mono text-sm">{summary.top.entry || "-"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-muted-foreground mb-1">Target</div>
                          <div className="font-mono text-sm text-buy">{summary.top.takeProfit || "-"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-muted-foreground mb-1">Stop Loss</div>
                          <div className="font-mono text-sm text-sell">{summary.top.stopLoss || "-"}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg border">
                    <ConfidenceGauge confidence={summary.top.confidence} size="lg" />
                    <span className="text-[10px] uppercase text-muted-foreground mt-2 font-bold tracking-wider">Confidence</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Waiting for the first signal...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                Price Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {isLoadingCandles ? (
                  <Skeleton className="w-full h-full" />
                ) : candles && candles.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={candles} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="openTime" 
                        tickFormatter={(t) => format(new Date(t), timeframe.includes('m') ? 'HH:mm' : 'MMM d')} 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickMargin={8}
                        minTickGap={30}
                      />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickFormatter={(val) => val.toLocaleString()}
                        width={60}
                        orientation="right"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        labelFormatter={(l) => format(new Date(l), 'PPpp')}
                        formatter={(val: number) => [`$${val.toLocaleString()}`, 'Close']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    No chart data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                Signal Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <Skeleton className="h-24 w-full" />
              ) : summary?.distribution ? (
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-buy">{summary.distribution.buy}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">BUY</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-wait-foreground">{summary.distribution.wait}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">WAIT</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-sell">{summary.distribution.sell}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">SELL</div>
                    </div>
                  </div>
                  
                  {/* Distribution Bar */}
                  {summary.strategiesActive > 0 && (
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div style={{ width: `${(summary.distribution.buy / summary.strategiesActive) * 100}%` }} className="bg-buy" />
                      <div style={{ width: `${(summary.distribution.wait / summary.strategiesActive) * 100}%` }} className="bg-wait" />
                      <div style={{ width: `${(summary.distribution.sell / summary.strategiesActive) * 100}%` }} className="bg-sell" />
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                Category Consensus
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {summary.categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                      <span className="text-xs font-bold">{cat.category}</span>
                      <div className="flex items-center gap-3">
                        <ConfidenceGauge confidence={cat.avgConfidence} size="sm" />
                        <SignalBadge signal={cat.signal} className="w-14" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No active categories
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
