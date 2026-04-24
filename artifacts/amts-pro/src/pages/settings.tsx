import { useTradingSettings } from "@/components/trading-settings-context";
import { useListPairs, useListTimeframes, StrategyMode } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { pair, timeframe, mode, setPair, setTimeframe, setMode } = useTradingSettings();
  const { data: pairs } = useListPairs();
  const { data: timeframes } = useListTimeframes();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-end justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure your terminal defaults. Settings are saved locally.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trading Preferences</CardTitle>
          <CardDescription>Default pair and timeframe used across the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default Trading Pair</Label>
            <Select value={pair} onValueChange={setPair}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select pair" />
              </SelectTrigger>
              <SelectContent>
                {pairs?.map((p) => (
                  <SelectItem key={p.symbol} value={p.symbol}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframes?.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex justify-between items-center w-full">
                      <span>{t.label}</span>
                      <span className="text-xs text-muted-foreground ml-4">{t.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terminal Mode</CardTitle>
          <CardDescription>Unlock advanced strategies and raw data views.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Pro Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enables quant strategies, high-risk models, and complex indicators.
              </p>
            </div>
            <Switch
              checked={mode === StrategyMode.PRO}
              onCheckedChange={(c) => setMode(c ? StrategyMode.PRO : StrategyMode.BEGINNER)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button variant="default" onClick={() => window.history.back()}>
          Done
        </Button>
      </div>
    </div>
  );
}
