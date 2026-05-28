import { useState } from "react";
import { format, subDays, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Link } from "lucide-react";
import { useFoodLogs, useDeleteFoodLog } from "../hooks/useFoods";
import { MealSection } from "../components/MealSection";
import { SkeletonLoader } from "../components/SkeletonLoader";
import { EmptyState } from "../components/EmptyState";
import { FoodLog } from "@food-tracker/shared";
import { Link as RouterLink } from "react-router-dom";

export function FoodLogPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { data: logs, isLoading } = useFoodLogs(date);
  const deleteLog = useDeleteFoodLog();

  const isToday = date === format(new Date(), "yyyy-MM-dd");
  const displayDate = isToday
    ? "Today"
    : format(new Date(date + "T12:00:00"), "EEE, MMM d");

  const grouped = (logs ?? []).reduce<Record<string, FoodLog[]>>((acc, log) => {
    (acc[log.mealType] = acc[log.mealType] ?? []).push(log);
    return acc;
  }, {});

  const handleDelete = (log: FoodLog) => {
    deleteLog.mutate({ id: log.id, date });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-100 px-4 pt-safe">
        <div className="flex items-center justify-between h-14">
          <h1 className="text-lg font-bold text-gray-900">Food Log</h1>
          <RouterLink
            to="/add-food"
            className="text-primary-600 font-semibold text-sm"
          >
            + Add
          </RouterLink>
        </div>
      </div>

      {/* Date nav */}
      <div className="bg-white px-4 pb-3 flex items-center justify-between">
        <button
          onClick={() =>
            setDate(format(subDays(new Date(date + "T12:00:00"), 1), "yyyy-MM-dd"))
          }
          className="p-2 rounded-full active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-500" />
        </button>
        <span className="text-sm font-semibold text-gray-800">{displayDate}</span>
        <button
          onClick={() =>
            setDate(format(addDays(new Date(date + "T12:00:00"), 1), "yyyy-MM-dd"))
          }
          disabled={isToday}
          className="p-2 rounded-full active:bg-gray-100 disabled:opacity-30"
        >
          <ChevronRight size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {isLoading ? (
          <SkeletonLoader rows={3} />
        ) : (logs ?? []).length === 0 ? (
          <EmptyState
            title="Nothing logged"
            description="Tap + Add to log a meal."
          />
        ) : (
          (["BREAKFAST", "LUNCH", "DINNER", "SNACK", "OTHER"] as const).map(
            (meal) => (
              <MealSection
                key={meal}
                mealType={meal}
                logs={grouped[meal] ?? []}
                onDelete={handleDelete}
              />
            )
          )
        )}
      </div>
    </div>
  );
}
