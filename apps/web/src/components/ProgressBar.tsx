import { clsx } from "clsx";

interface ProgressBarProps {
  consumed: number;
  goal: number;
  className?: string;
}

export function ProgressBar({ consumed, goal, className }: ProgressBarProps) {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const isOver = consumed > goal;

  return (
    <div className={clsx("w-full", className)}>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            isOver ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-primary-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
