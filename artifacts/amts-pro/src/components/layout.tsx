import { useTradingSettings } from "./trading-settings-context";
import { Link, useLocation } from "wouter";
import {
  useListPairs,
  useListTimeframes,
  StrategyMode,
} from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { pair, timeframe, mode, setPair, setTimeframe, setMode } = useTradingSettings();
  const { data: pairs } = useListPairs();
  const { data: timeframes } = useListTimeframes();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/signals", label: "Signals" },
    { href: "/history", label: "History" },
    { href: "/strategies", label: "Strategies" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 mr-4">
            <div className="w-8 h-8 bg-primary rounded text-primary-foreground flex items-center justify-center font-bold text-lg">
              A
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">AMTS Pro</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  location === link.href ? "text-foreground" : "text-foreground/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {pairs && timeframes && (
              <>
                <Select value={pair} onValueChange={setPair}>
                  <SelectTrigger className="w-[120px] h-8 bg-secondary border-none text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pairs.map((p) => (
                      <SelectItem key={p.symbol} value={p.symbol}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-[80px] h-8 bg-secondary border-none text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            
            <div className="flex items-center space-x-2 border-l border-border pl-4 hidden md:flex">
              <Label htmlFor="pro-mode" className="text-xs font-mono">PRO</Label>
              <Switch
                id="pro-mode"
                checked={mode === StrategyMode.PRO}
                onCheckedChange={(c) => setMode(c ? StrategyMode.PRO : StrategyMode.BEGINNER)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-8 container mx-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
