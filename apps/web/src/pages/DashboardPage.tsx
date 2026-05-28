import { useState } from "react";
import { Link } from "react-router-dom";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { CalorieSummary } from "../components/CalorieSummary";
import { CardSkeleton } from "../components/SkeletonLoader";
import { EmptyState } from "../components/EmptyState";
import { MealSection } from "../components/MealSection";

export function DashboardPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { data, isLoading } = useDashboard(date);

  const isToday = date === format(new Date(), "yyyy-MM-dd");
  const displayDate = isToday
    ? "Today"
    : format(new Date(date + "T12:00:00"), "EEE, MMM d");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-safe">
        <div className="flex items-center justify-between h-14">
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <Link
            to="/add-food"
            className="flex items-center gap-1 text-primary-600 font-medium text-sm"
          >
            <Plus size={18} />
            Add
          </Link>
        </div>
      </div>

      {/* Date navigation */}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : !data ? (
          <EmptyState
            title="No data available"
            description="Start tracking your meals today."
          />
        ) : (
          <>
            <CalorieSummary data={data} />

            {/* Meal sections */}
            {(["BREAKFAST", "LUNCH", "DINNER", "SNACKS"] as const).map(
              (mealType) => {
                const logs = data.mealBreakdown[mealType] ?? [];
                return (
                  <MealSection key={mealType} mealType={mealType} logs={logs} />
                );
              }
            )}

            {data.totalCaloriesConsumed === 0 && (
              <EmptyState
                title="Nothing logged yet"
                description="Tap Add to log your first meal for the day."
                action={
                  <Link to="/add-food" className="btn-primary" style={{ width: "auto", paddingInline: "24px" }}>
                    Add Food
                  </Link>
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
