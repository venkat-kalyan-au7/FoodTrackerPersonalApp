import { FoodLog } from "@food-tracker/shared";
import { Trash2 } from "lucide-react";

interface MealSectionProps {
  mealType: string;
  logs: FoodLog[];
  onDelete?: (log: FoodLog) => void;
}

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACKS: "Snacks",
};

const MEAL_COLORS: Record<string, string> = {
  BREAKFAST: "text-orange-600 bg-orange-50",
  LUNCH: "text-green-600 bg-green-50",
  DINNER: "text-blue-600 bg-blue-50",
  SNACKS: "text-purple-600 bg-purple-50",
};

export function MealSection({ mealType, logs, onDelete }: MealSectionProps) {
  if (logs.length === 0) return null;

  const mealCalories = logs.reduce((sum, l) => sum + l.calculatedCalories, 0);

  return (
    <div className="card mb-3">
      {/* Meal header */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            MEAL_COLORS[mealType] ?? "text-gray-600 bg-gray-50"
          }`}
        >
          {MEAL_LABELS[mealType] ?? mealType}
        </span>
        <span className="text-sm font-semibold text-gray-600">
          {Math.round(mealCalories)} kcal
        </span>
      </div>

      {/* Food log rows */}
      <div className="divide-y divide-gray-50">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center gap-3 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 leading-snug">
                {log.foodNameSnapshot}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {log.consumedWeightG}g
              </p>
              {(log.calculatedProtein != null || log.calculatedCarbs != null || log.calculatedFat != null) && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {log.calculatedProtein != null && <span className="text-blue-500">P {log.calculatedProtein}g </span>}
                  {log.calculatedCarbs != null && <span className="text-yellow-600">C {log.calculatedCarbs}g </span>}
                  {log.calculatedFat != null && <span className="text-orange-500">F {log.calculatedFat}g</span>}
                  {log.calculatedFiber != null && <span className="text-green-600"> · Fiber {log.calculatedFiber}g</span>}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-gray-900">
                {Math.round(log.calculatedCalories)} kcal
              </p>
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(log)}
                className="p-1.5 text-gray-300 active:text-red-500 rounded-full touch-manipulation"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
