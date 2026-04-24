import { useState } from "react";
import { useTradingSettings } from "@/components/trading-settings-context";
import { useGetSignalHistory } from "@workspace/api-client-react";
import { SignalBadge } from "@/components/signal-badge";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function History() {
  const { pair, timeframe } = useTradingSettings();
  const [limit, setLimit] = useState(20);
  
  const { data: history, isLoading } = useGetSignalHistory({
    pair,
    timeframe,
    limit
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Signal History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Historical signals for {pair} ({timeframe})
          </p>
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[180px]">Time</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Signal</TableHead>
              <TableHead className="text-right">Conf.</TableHead>
              <TableHead className="text-right">Entry</TableHead>
              <TableHead className="text-right">Take Profit</TableHead>
              <TableHead className="text-right">Stop Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : history && history.length > 0 ? (
              history.map((signal) => (
                <TableRow key={signal.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {format(new Date(signal.createdAt), "MM/dd HH:mm:ss")}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {signal.strategyName}
                  </TableCell>
                  <TableCell>
                    <SignalBadge signal={signal.signal} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    <span className={signal.confidence >= 80 ? "text-primary font-bold" : "text-muted-foreground"}>
                      {Math.round(signal.confidence)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {signal.entry || "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-buy">
                    {signal.takeProfit || "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-sell">
                    {signal.stopLoss || "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No historical signals found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {history && history.length === limit && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setLimit(l => l + 20)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
