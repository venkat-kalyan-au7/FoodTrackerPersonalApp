import { DashboardData } from "@food-tracker/shared";

interface CalorieSummaryProps {
  data: DashboardData;
}

const SIZE = 128;
const CENTER = SIZE / 2;
const RADIUS = 48;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CalorieSummary({ data }: CalorieSummaryProps) {
  const consumed = data.totalCaloriesConsumed;
  const goal = data.calorieGoal;
  const remaining = goal - consumed;
  const isOver = remaining < 0;
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - pct);
  const ringColor = isOver ? "#ef4444" : pct > 0.85 ? "#f59e0b" : "#16a34a";

  return (
    <div className="card-elevated">
      <div className="flex items-center gap-5">
        {/* Donut ring */}
        <div className="relative shrink-0">
          <svg
            width={SIZE}
            height={SIZE}
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={STROKE}
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{
                transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
              {Math.round(consumed)}
            </span>
            <span className="text-[10px] text-gray-400 font-medium mt-0.5">kcal</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Goal</p>
            <p className="text-lg font-bold text-gray-800 tabular-nums">
              {goal}
              <span className="text-xs font-normal text-gray-400 ml-0.5">kcal</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {isOver ? "Over by" : "Remaining"}
            </p>
            <p
              className={`text-lg font-bold tabular-nums ${
                isOver ? "text-red-500" : "text-primary-600"
              }`}
            >
              {Math.abs(Math.round(remaining))}
              <span className="text-xs font-normal text-gray-400 ml-0.5">kcal</span>
            </p>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct * 100}%`, backgroundColor: ringColor }}
            />
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-100">
        <MacroPill label="Protein" value={data.totalProtein ?? 0} bg="bg-blue-50" text="text-blue-600" />
        <MacroPill label="Carbs" value={data.totalCarbs ?? 0} bg="bg-amber-50" text="text-amber-600" />
        <MacroPill label="Fat" value={data.totalFat ?? 0} bg="bg-orange-50" text="text-orange-600" />
        <MacroPill label="Fiber" value={data.totalFiber ?? 0} bg="bg-green-50" text="text-green-600" />
      </div>
    </div>
  );
}

function MacroPill({
  label,
  value,
  bg,
  text,
}: {
  label: string;
  value: number;
  bg: string;
  text: string;
}) {
  return (
    <div className={`${bg} rounded-xl px-1.5 py-2 text-center`}>
      <p className={`text-sm font-bold ${text} tabular-nums leading-tight`}>
        {Math.round(value)}
        <span className="text-[10px] font-normal text-gray-400">g</span>
      </p>
      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}
