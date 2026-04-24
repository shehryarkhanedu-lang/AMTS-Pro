import { cn } from "@/lib/utils";

export function ConfidenceGauge({ confidence, className, size = "md" }: { confidence: number, className?: string, size?: "sm" | "md" | "lg" }) {
  // Map confidence (0-100) to color
  const getColor = () => {
    if (confidence >= 80) return "text-primary";
    if (confidence >= 50) return "text-primary/70";
    return "text-muted-foreground";
  };

  const sizes = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-12 h-12 text-xs",
    lg: "w-16 h-16 text-sm",
  };

  const strokeWidth = size === "lg" ? 4 : 3;
  const radius = size === "lg" ? 28 : size === "md" ? 20 : 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", sizes[size], className)}>
      <svg className="absolute w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="stroke-muted fill-none"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className={cn("fill-none transition-all duration-1000 ease-out", getColor(), "stroke-current")}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className={cn("font-mono font-bold", getColor())}>
        {Math.round(confidence)}
      </span>
    </div>
  );
}
