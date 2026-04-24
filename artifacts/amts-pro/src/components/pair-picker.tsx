import { useMemo, useState } from "react";
import { useListPairs, type Pair } from "@workspace/api-client-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ASSET_CLASS_ORDER = [
  "CRYPTO",
  "FOREX",
  "COMMODITIES",
  "INDICES",
  "ETFS",
  "STOCKS",
] as const;

export function PairPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (symbol: string) => void;
}) {
  const { data: pairs } = useListPairs();
  const [open, setOpen] = useState(false);

  const grouped = useMemo(() => {
    if (!pairs) return [];
    const map = new Map<string, { label: string; items: Pair[] }>();
    for (const p of pairs) {
      const cls = p.assetClass;
      const cur = map.get(cls) ?? { label: p.assetClassLabel, items: [] };
      cur.items.push(p);
      map.set(cls, cur);
    }
    return ASSET_CLASS_ORDER.map((cls) => ({
      cls,
      ...(map.get(cls) ?? { label: cls, items: [] as Pair[] }),
    })).filter((g) => g.items.length > 0);
  }, [pairs]);

  const selected = pairs?.find((p) => p.symbol === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] h-8 justify-between bg-secondary border-none text-xs font-normal"
        >
          <span className="truncate">{selected?.label ?? value}</span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search markets..." className="h-9" />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No market found.</CommandEmpty>
            {grouped.map((g) => (
              <CommandGroup key={g.cls} heading={g.label}>
                {g.items.map((p) => (
                  <CommandItem
                    key={p.symbol}
                    value={`${p.label} ${p.symbol}`}
                    onSelect={() => {
                      onChange(p.symbol);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === p.symbol ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{p.label}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                      {p.symbol}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
