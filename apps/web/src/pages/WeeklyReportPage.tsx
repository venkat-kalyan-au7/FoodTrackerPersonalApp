import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, subDays, addDays, parseISO } from "date-fns";
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Flame, Target, Calendar } from "lucide-react";
import { useWeeklySummary } from "../hooks/useDashboard";
import { CardSkeleton } from "../components/SkeletonLoader";

function getWeekStart(from: Date): string {
  return format(from, "yyyy-MM-dd");
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getDayLabel(dateStr: string, short = true): string {
  const d = parseISO(dateStr);
  return short ? format(d, "EEE") : format(d, "EEE, MMM d");
}

function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "MMM d");
}

export function WeeklyReportPage() {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.

  const todayMidnight = new Date();
  todayMidnight.setHours(12, 0, 0, 0);
  const weekStart = subDays(todayMidnight, 6 + weekOffset * 7);
  const startDateStr = getWeekStart(weekStart);

  const isCurrentWeek = weekOffset === 0;
  const { data, isLoading } = useWeeklySummary(startDateStr);

  // Derived stats
  const totalConsumed = data?.dailyData.reduce((s, d) => s + d.consumed, 0) ?? 0;
  const totalGoal = data?.dailyData.reduce((s, d) => s + d.goal, 0) ?? 0;
  const totalSaved = data?.dailyData.reduce((s, d) => s + Math.max(0, d.goal - d.consumed), 0) ?? 0;
  const totalOver = data?.dailyData.reduce((s, d) => s + Math.max(0, d.consumed - d.goal), 0) ?? 0;
  const avgConsumed = data?.averageConsumed ?? 0;
  const daysWithin = data?.daysWithinGoal ?? 0;
  const daysAbove = data?.daysAboveGoal ?? 0;
  const daysLogged = data?.dailyData.filter((d) => d.consumed > 0).length ?? 0;

  // Bar chart scaling — normalize against highest of (consumed, goal)
  const maxVal = data
    ? Math.max(...data.dailyData.map((d) => Math.max(d.consumed, d.goal)), 1)
    : 1;

  const weekLabel =
    data
      ? `${formatDate(data.startDate)} – ${formatDate(data.endDate)}`
      : "–";

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-safe">
        <div className="flex items-center gap-3 h-14">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft size={22} className="text-gray-700" />
          </button>
          <h1 className="text-base font-bold text-gray-900 flex-1">Weekly Report</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="p-1.5 rounded-full active:bg-gray-100"
            >
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
            <span className="text-xs font-semibold text-gray-500 w-28 text-center">
              {weekLabel}
            </span>
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              disabled={isCurrentWeek}
              className="p-1.5 rounded-full active:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 space-y-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No data yet</p>
            <p className="text-gray-400 text-sm mt-1">Start logging meals to see your weekly report.</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-orange-500 mb-0.5">
                  <Flame size={15} strokeWidth={2} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Avg / day</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {avgConsumed.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">kcal consumed</p>
              </div>

              <div className="card flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-primary-500 mb-0.5">
                  <Target size={15} strokeWidth={2} />
                  <span className="text-xs font-semibold uppercase tracking-wide">On track</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {daysWithin}<span className="text-base font-normal text-gray-400"> / {daysLogged}</span>
                </p>
                <p className="text-xs text-gray-400">days within goal</p>
              </div>

              <div className="card flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-green-500 mb-0.5">
                  <TrendingDown size={15} strokeWidth={2} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Saved</span>
                </div>
                <p className="text-2xl font-bold text-green-600 tabular-nums">
                  {totalSaved.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">kcal under budget</p>
              </div>

              <div className="card flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-red-400 mb-0.5">
                  <TrendingUp size={15} strokeWidth={2} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Over</span>
                </div>
                <p className="text-2xl font-bold text-red-500 tabular-nums">
                  {totalOver.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">kcal above budget</p>
              </div>
            </div>

            {/* Bar chart */}
            <div className="card">
              <p className="text-sm font-semibold text-gray-700 mb-3">Daily calories</p>
              <div className="flex items-end gap-1.5 h-32">
                {data.dailyData.map((day) => {
                  const isOver = day.consumed > day.goal;
                  const consumedPct = (day.consumed / maxVal) * 100;
                  const goalLinePct = (day.goal / maxVal) * 100;
                  const hasData = day.consumed > 0;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="relative w-full flex items-end" style={{ height: "96px" }}>
                        {/* Goal line */}
                        <div
                          className="absolute inset-x-0 border-t border-dashed border-gray-300"
                          style={{ bottom: `${goalLinePct}%` }}
                        />
                        {/* Bar */}
                        {hasData ? (
                          <div
                            className={`w-full rounded-t-sm transition-all duration-500 ${
                              isOver ? "bg-red-400" : "bg-primary-500"
                            }`}
                            style={{ height: `${consumedPct}%` }}
                          />
                        ) : (
                          <div className="w-full rounded-t-sm bg-gray-100" style={{ height: "6px" }} />
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-gray-400">
                        {getDayLabel(day.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-primary-500" />
                  <span className="text-xs text-gray-500">Within goal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-red-400" />
                  <span className="text-xs text-gray-500">Over goal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 border-t border-dashed border-gray-400" />
                  <span className="text-xs text-gray-500">Goal</span>
                </div>
              </div>
            </div>

            {/* Day-by-day breakdown */}
            <div className="card">
              <p className="text-sm font-semibold text-gray-700 mb-3">Day by day</p>
              <div className="space-y-3">
                {data.dailyData.map((day) => {
                  const isOver = day.consumed > day.goal;
                  const diff = Math.abs(day.consumed - day.goal);
                  const hasData = day.consumed > 0;
                  const pct = day.goal > 0 ? Math.min((day.consumed / day.goal) * 100, 100) : 0;
                  return (
                    <div key={day.date}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-600">
                          {getDayLabel(day.date, false)}
                        </span>
                        <div className="flex items-center gap-2">
                          {hasData ? (
                            <>
                              <span className="text-xs tabular-nums text-gray-700">
                                {day.consumed.toLocaleString()} / {day.goal.toLocaleString()} kcal
                              </span>
                              {isOver ? (
                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                                  +{diff.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                  -{diff.toLocaleString()}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-300">Not logged</span>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        {hasData && (
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOver ? "bg-red-400" : "bg-primary-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Week total */}
            <div className="card bg-gradient-to-br from-primary-50 to-white border border-primary-100">
              <p className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-2">
                Week total
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">
                    {totalConsumed.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">kcal consumed</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-gray-600 tabular-nums">
                    {totalGoal.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">weekly budget</p>
                </div>
              </div>
              <div className="mt-3 h-2 bg-primary-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    totalConsumed > totalGoal ? "bg-red-400" : "bg-primary-500"
                  }`}
                  style={{
                    width: `${totalGoal > 0 ? Math.min((totalConsumed / totalGoal) * 100, 100) : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {totalConsumed <= totalGoal
                  ? `${(totalGoal - totalConsumed).toLocaleString()} kcal under your weekly budget`
                  : `${(totalConsumed - totalGoal).toLocaleString()} kcal over your weekly budget`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
