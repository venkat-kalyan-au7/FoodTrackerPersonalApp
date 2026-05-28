import { useState, useEffect } from "react";
import { X, Check, Trash2, Loader2 } from "lucide-react";
import { FoodLog, MealType } from "@food-tracker/shared";
import { useUpdateFoodLog, useDeleteFoodLog } from "../hooks/useFoods";

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "SNACKS", label: "Snack" },
];

interface EditFoodLogSheetProps {
  log: FoodLog | null;
  date: string;
  onClose: () => void;
}

export function EditFoodLogSheet({ log, date, onClose }: EditFoodLogSheetProps) {
  const [weightG, setWeightG] = useState("");
  const [mealType, setMealType] = useState<MealType>("LUNCH");
  const updateLog = useUpdateFoodLog();
  const deleteLog = useDeleteFoodLog();

  useEffect(() => {
    if (log) {
      setWeightG(String(log.consumedWeightG ?? 100));
      setMealType(log.mealType);
    }
  }, [log]);

  if (!log) return null;

  const w = parseFloat(weightG || "0");
  const per100 = log.caloriesPer100gSnapshot ?? 0;
  const estCalories = w > 0 ? Math.round((per100 * w) / 100) : null;
  const estProtein =
    log.proteinPer100gSnapshot != null && w > 0
      ? Math.round((log.proteinPer100gSnapshot * w) / 100 * 10) / 10
      : null;
  const estCarbs =
    log.carbsPer100gSnapshot != null && w > 0
      ? Math.round((log.carbsPer100gSnapshot * w) / 100 * 10) / 10
      : null;
  const estFat =
    log.fatPer100gSnapshot != null && w > 0
      ? Math.round((log.fatPer100gSnapshot * w) / 100 * 10) / 10
      : null;
  const estFiber =
    log.fiberPer100gSnapshot != null && w > 0
      ? Math.round((log.fiberPer100gSnapshot * w) / 100 * 10) / 10
      : null;

  const handleSave = async () => {
    if (!w || w <= 0) return;
    await updateLog.mutateAsync({ id: log.id, date, consumedWeightG: w, mealType });
    onClose();
  };

  const handleDelete = async () => {
    await deleteLog.mutateAsync({ id: log.id, date });
    onClose();
  };

  const macros = [
    { label: "Protein", value: estProtein, bar: "bg-blue-400", bg: "bg-blue-50", text: "text-blue-700", per100: log.proteinPer100gSnapshot },
    { label: "Carbs",   value: estCarbs,   bar: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700", per100: log.carbsPer100gSnapshot },
    { label: "Fat",     value: estFat,     bar: "bg-orange-400", bg: "bg-orange-50", text: "text-orange-700", per100: log.fatPer100gSnapshot },
    { label: "Fiber",   value: estFiber,   bar: "bg-green-400", bg: "bg-green-50", text: "text-green-700", per100: log.fiberPer100gSnapshot },
  ].filter(({ value }) => value != null);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
              Edit Entry
            </p>
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              {log.foodNameSnapshot}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 active:bg-gray-200 shrink-0"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Quantity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Quantity</label>
              <span className="text-xs text-gray-400">grams</span>
            </div>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              max="2000"
              className="input-field text-2xl font-bold text-gray-900"
              value={weightG}
              onChange={(e) => setWeightG(e.target.value)}
            />
            <div className="flex gap-2 mt-2.5 flex-wrap">
              {[50, 100, 150, 200, 250, 300].map((p) => (
                <button
                  key={p}
                  onClick={() => setWeightG(String(p))}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    weightG === String(p)
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 active:bg-gray-200"
                  }`}
                >
                  {p}g
                </button>
              ))}
            </div>
          </div>

          {/* Nutrition preview */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Nutrition preview
              <span className="text-xs font-normal text-gray-400 ml-1">for {weightG || "–"}g</span>
            </p>

            <div className="bg-primary-50 rounded-xl px-4 py-3 flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary-700">Calories</span>
              <span className="text-2xl font-bold text-primary-700 tabular-nums">
                {estCalories ?? "–"}
                <span className="text-sm font-normal text-primary-400 ml-1">kcal</span>
              </span>
            </div>

            {macros.length > 0 && (
              <div className="space-y-2">
                {macros.map(({ label, value, bar, bg, text, per100 }) => {
                  const pct =
                    per100 != null && per100 > 0
                      ? Math.min(((value ?? 0) / per100) * 100, 100)
                      : 0;
                  return (
                    <div key={label} className={`${bg} rounded-xl px-3 py-2`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold ${text}`}>{label}</span>
                        <span className={`text-sm font-bold ${text} tabular-nums`}>{value}g</span>
                      </div>
                      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${bar} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Meal type */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Meal</label>
            <div className="flex gap-2 flex-wrap">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMealType(m.value)}
                  className={`meal-chip ${mealType === m.value ? "meal-chip-active" : "meal-chip-inactive"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-8 pt-2 flex gap-3">
          <button
            onClick={handleDelete}
            disabled={deleteLog.isPending}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-500 font-semibold text-sm active:bg-red-50 disabled:opacity-50 min-w-[56px]"
          >
            {deleteLog.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={updateLog.isPending || !weightG || w <= 0}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {updateLog.isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Check size={16} strokeWidth={2.5} /> Save {estCalories ? `· ${estCalories} kcal` : ""}</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
