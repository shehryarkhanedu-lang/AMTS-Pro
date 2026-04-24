import { useTradingSettings } from "@/components/trading-settings-context";
import { useListStrategies, StrategyCategory, RiskLevel, StrategyMode } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Strategies() {
  const { mode } = useTradingSettings();
  const { data: strategies, isLoading } = useListStrategies();

  // Group by category
  const grouped = strategies?.reduce((acc, strategy) => {
    if (!acc[strategy.category]) acc[strategy.category] = [];
    acc[strategy.category].push(strategy);
    return acc;
  }, {} as Record<string, typeof strategies>);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Strategy Library</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Available trading models and logic definitions.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      ) : grouped ? (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-bold font-mono tracking-wider uppercase mb-4 text-primary border-b border-border/50 pb-2 inline-block">
                {category.replace('_', ' ')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((strategy) => (
                  <Card key={strategy.key} className={strategy.mode === StrategyMode.PRO && mode !== StrategyMode.PRO ? "opacity-50 grayscale pointer-events-none" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          {strategy.riskLevel === RiskLevel.HIGH && (
                            <Badge variant="destructive" className="text-[10px] h-5 uppercase">High Risk</Badge>
                          )}
                          {strategy.mode === StrategyMode.PRO && (
                            <Badge variant="outline" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20">PRO</Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-base">{strategy.name}</CardTitle>
                      <CardDescription className="text-xs">{strategy.description}</CardDescription>
                    </CardHeader>
                    {strategy.logic && (
                      <CardContent>
                        <div className="bg-secondary/30 p-3 rounded text-xs font-mono text-muted-foreground">
                          {strategy.logic}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-secondary/10">
          No strategies available.
        </div>
      )}
    </div>
  );
}
