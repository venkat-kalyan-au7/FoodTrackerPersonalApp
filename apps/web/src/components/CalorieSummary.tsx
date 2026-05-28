import { DashboardData } from "@food-tracker/shared";
import { ProgressBar } from "./ProgressBar";

interface CalorieSummaryProps {
  data: DashboardData;
}

export function CalorieSummary({ data }: CalorieSummaryProps) {
  const remaining = data.calorieGoal - data.totalCaloriesConsumed;
  const isOver = remaining < 0;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-sm text-gray-500 font-medium">Consumed</p>
          <p className="text-3xl font-bold text-gray-900">
            {Math.round(data.totalCaloriesConsumed)}
            <span className="text-base font-normal text-gray-400"> kcal</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 font-medium">
            {isOver ? "Over goal" : "Remaining"}
          </p>
          <p
            className={`text-2xl font-bold ${
              isOver ? "text-red-500" : "text-primary-600"
            }`}
          >
            {Math.abs(Math.round(remaining))}
            <span className="text-base font-normal text-gray-400"> kcal</span>
          </p>
        </div>
      </div>

      <ProgressBar consumed={data.totalCaloriesConsumed} goal={data.calorieGoal} />

      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">0</span>
        <span className="text-xs text-gray-500">Goal: {data.calorieGoal} kcal</span>
      </div>

      {/* Macro summary */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-100">
        <MacroCell
          label="Protein"
          value={data.totalProtein ?? 0}
          unit="g"
          color="text-blue-600"
        />
        <MacroCell
          label="Carbs"
          value={data.totalCarbs ?? 0}
          unit="g"
          color="text-yellow-600"
        />
        <MacroCell
          label="Fat"
          value={data.totalFat ?? 0}
          unit="g"
          color="text-orange-600"
        />
        <MacroCell
          label="Fiber"
          value={data.totalFiber ?? 0}
          unit="g"
          color="text-green-600"
        />
      </div>
    </div>
  );
}

function MacroCell({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${color}`}>
        {Math.round(value)}
        <span className="text-xs font-normal text-gray-400"> {unit}</span>
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
