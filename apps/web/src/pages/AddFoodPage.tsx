import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Search, X, ArrowLeft, AlertTriangle, Sparkles, Loader2, Pencil, Check } from "lucide-react";
import { useFoodSearch, useRecentFoods, useLogFood, useEstimateFood } from "../hooks/useFoods";
import { useFavourites, useAddFavourite, useRemoveFavourite } from "../hooks/useFavourites";
import { FoodCard } from "../components/FoodCard";
import { SkeletonLoader } from "../components/SkeletonLoader";
import { EmptyState } from "../components/EmptyState";
import { FoodSearchResult } from "@food-tracker/shared";
import toast from "react-hot-toast";

const MEAL_TYPES = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "SNACKS", label: "Snack" },
];

function guessCurrentMeal(): string {
  const hour = new Date().getHours();
  if (hour < 10) return "BREAKFAST";
  if (hour < 14) return "LUNCH";
  if (hour < 17) return "SNACKS";
  if (hour < 21) return "DINNER";
  return "SNACKS";
}

export function AddFoodPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [weightG, setWeightG] = useState("");
  const [mealType, setMealType] = useState(guessCurrentMeal());
  const [date] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: searchResults, isLoading: searching } = useFoodSearch(query);
  const { data: recentFoods } = useRecentFoods();
  const { data: favourites } = useFavourites();
  const addFav = useAddFavourite();
  const removeFav = useRemoveFavourite();
  const logFood = useLogFood();
  const estimateFood = useEstimateFood();

  const favouriteIds = new Set(favourites?.map((f) => f.id) ?? []);

  const handleSelectFood = (food: FoodSearchResult) => {
    setSelectedFood(food);
    setWeightG(String(food.defaultServingWeightG ?? 100));
  };

  const handleLog = async () => {
    if (!selectedFood || !weightG) return;
    const w = parseFloat(weightG);
    if (isNaN(w) || w <= 0) {
      toast.error("Enter a valid weight");
      return;
    }
    await logFood.mutateAsync({
      foodId: selectedFood.id,
      consumedDate: date,
      mealType,
      consumedWeightG: w,
    });
    navigate("/");
  };

  const toggleFav = (food: FoodSearchResult) => {
    if (favouriteIds.has(food.id)) {
      removeFav.mutate(food.id);
    } else {
      addFav.mutate(food.id);
    }
  };

  const estimatedCalories =
    selectedFood && weightG
      ? Math.round((selectedFood.caloriesPer100g ?? 0) * parseFloat(weightG || "0") / 100)
      : null;

  const w = parseFloat(weightG || "0");
  const estimatedProtein = selectedFood?.proteinPer100g != null && w > 0
    ? Math.round(selectedFood.proteinPer100g * w / 100 * 10) / 10 : null;
  const estimatedCarbs = selectedFood?.carbsPer100g != null && w > 0
    ? Math.round(selectedFood.carbsPer100g * w / 100 * 10) / 10 : null;
  const estimatedFat = selectedFood?.fatPer100g != null && w > 0
    ? Math.round(selectedFood.fatPer100g * w / 100 * 10) / 10 : null;
  const estimatedFiber = selectedFood?.fiberPer100g != null && w > 0
    ? Math.round(selectedFood.fiberPer100g * w / 100 * 10) / 10 : null;

  if (selectedFood) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 pt-safe">
          <div className="flex items-center gap-3 h-14">
            <button
              onClick={() => setSelectedFood(null)}
              className="p-1 rounded-full active:bg-gray-100"
              aria-label="Change food"
            >
              <ArrowLeft size={22} className="text-gray-700" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 truncate flex-1">
              Log Food
            </h1>
            <button
              onClick={() => setSelectedFood(null)}
              className="text-xs text-primary-600 font-medium px-2.5 py-1 bg-primary-50 rounded-full active:bg-primary-100"
            >
              Change
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-3">
          {/* Food name card */}
          <div className="card-elevated flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
              <span className="text-xl">🍽️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-snug">
                {selectedFood.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedFood.caloriesPer100g} kcal · 100g
              </p>
            </div>
          </div>

          {/* Variation warning */}
          {selectedFood.requiresVariationWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Calorie values may vary with your recipe or restaurant. Use as an estimate.
              </p>
            </div>
          )}

          {/* Weight input */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Quantity
              </label>
              <span className="text-xs text-gray-400">grams</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="decimal"
                min="1"
                max="2000"
                className="input-field text-2xl font-bold text-gray-900 flex-1"
                value={weightG}
                onChange={(e) => setWeightG(e.target.value)}
                placeholder="100"
              />
            </div>
            {/* Quick presets */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {[
                ...(selectedFood.defaultServingWeightG
                  ? [{ label: `1 serving (${selectedFood.defaultServingWeightG}g)`, value: selectedFood.defaultServingWeightG }]
                  : []),
                { label: "50g", value: 50 },
                { label: "100g", value: 100 },
                { label: "150g", value: 150 },
                { label: "200g", value: 200 },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setWeightG(String(p.value))}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    weightG === String(p.value)
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 active:bg-gray-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nutrition preview */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Nutrition preview</p>
              <span className="text-xs text-gray-400">for {weightG || "–"}g</span>
            </div>

            {/* Calorie highlight */}
            <div className="bg-primary-50 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-primary-700">Calories</span>
              <span className="text-2xl font-bold text-primary-700 tabular-nums">
                {estimatedCalories ?? "–"}
                <span className="text-sm font-normal text-primary-400 ml-1">kcal</span>
              </span>
            </div>

            {/* Macro rows */}
            {(estimatedProtein != null || estimatedCarbs != null || estimatedFat != null) && (
              <div className="space-y-2">
                {[
                  { label: "Protein", value: estimatedProtein, unit: "g", bar: "bg-blue-400", bg: "bg-blue-50", text: "text-blue-700", per100: selectedFood.proteinPer100g },
                  { label: "Carbs",   value: estimatedCarbs,   unit: "g", bar: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700", per100: selectedFood.carbsPer100g },
                  { label: "Fat",     value: estimatedFat,     unit: "g", bar: "bg-orange-400", bg: "bg-orange-50", text: "text-orange-700", per100: selectedFood.fatPer100g },
                  { label: "Fiber",   value: estimatedFiber,   unit: "g", bar: "bg-green-400", bg: "bg-green-50", text: "text-green-700", per100: selectedFood.fiberPer100g },
                ]
                  .filter(({ value }) => value != null)
                  .map(({ label, value, unit, bar, bg, text, per100 }) => {
                    const pct = per100 != null && per100 > 0 ? Math.min(((value ?? 0) / (per100)) * 100, 100) : 0;
                    return (
                      <div key={label} className={`${bg} rounded-xl px-3 py-2`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${text}`}>{label}</span>
                          <span className={`text-sm font-bold ${text} tabular-nums`}>
                            {value}{unit}
                          </span>
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
          <div className="card">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Meal
            </label>
            <div className="flex gap-2 flex-wrap">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMealType(m.value)}
                  className={`meal-chip ${
                    mealType === m.value ? "meal-chip-active" : "meal-chip-inactive"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Log button */}
        <div className="fixed bottom-16 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 z-50">
          <button
            onClick={handleLog}
            disabled={logFood.isPending || !weightG}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {logFood.isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Logging...</>
            ) : (
              <><Check size={16} strokeWidth={2.5} /> Log {estimatedCalories ? `${estimatedCalories} kcal` : "Food"}</>
            )}
          </button>
        </div>
      </div>
    );
  }

  const listToShow = query.trim()
    ? searchResults
    : recentFoods;

  const handleEstimate = async () => {
    if (!query.trim()) return;
    try {
      const food = await estimateFood.mutateAsync(query.trim());
      handleSelectFood(food);
    } catch {
      toast.error("Could not estimate nutrition. Check your Gemini API key in settings.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-safe">
        <div className="flex items-center gap-3 h-14">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={22} className="text-gray-700" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">Add Food</h1>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white px-4 pb-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-11">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="search"
            inputMode="search"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-gray-400"
            placeholder="Search Indian foods..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto pb-24">
        {searching ? (
          <div className="px-4 mt-2">
            <SkeletonLoader rows={4} />
          </div>
        ) : listToShow && listToShow.length > 0 ? (
          <div className="divide-y divide-gray-100 px-4">
            {!query.trim() && (
              <p className="text-xs font-semibold text-gray-400 py-2 uppercase tracking-wide">
                Recent
              </p>
            )}
            {listToShow.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onSelect={handleSelectFood}
                onFavourite={toggleFav}
                isFavourited={favouriteIds.has(food.id)}
              />
            ))}
            {query.trim() && (
              <div className="py-4">
                <button
                  onClick={handleEstimate}
                  disabled={estimateFood.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-primary-300 text-primary-600 font-medium text-sm active:bg-primary-50"
                >
                  {estimateFood.isPending
                    ? <><Loader2 size={16} className="animate-spin" /> Estimating…</>
                    : <><Sparkles size={16} /> Estimate "{query}" with AI</>}
                </button>
              </div>
            )}
          </div>
        ) : query.trim() ? (
          <div className="px-4">
            <EmptyState
              title="No results found"
              description={`Try searching in English or Telugu. e.g. "Pappu" for dal.`}
            />
            <button
              onClick={handleEstimate}
              disabled={estimateFood.isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-primary-600 text-white font-semibold text-sm mt-2"
            >
              {estimateFood.isPending
                ? <><Loader2 size={16} className="animate-spin" /> Estimating nutrition…</>
                : <><Sparkles size={16} /> Estimate "{query}" with AI</>}
            </button>
          </div>
        ) : (
          <EmptyState
            title="Start searching"
            description="Search for Indian foods or log a recipe."
          />
        )}
      </div>
    </div>
  );
}
