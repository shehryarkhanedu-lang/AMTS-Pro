import { SignalType } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function SignalBadge({ signal, className }: { signal: SignalType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider",
        signal === SignalType.BUY && "bg-buy/10 text-buy border border-buy/20",
        signal === SignalType.SELL && "bg-sell/10 text-sell border border-sell/20",
        signal === SignalType.WAIT && "bg-wait/10 text-wait-foreground border border-wait/20",
        className
      )}
    >
      {signal}
    </span>
  );
}
