import { FoodSearchResult } from "@food-tracker/shared";
import { SOURCE_DISPLAY_LABELS } from "@food-tracker/shared";
import { AlertTriangle, Star } from "lucide-react";
import { clsx } from "clsx";

interface FoodCardProps {
  food: FoodSearchResult;
  onSelect?: (food: FoodSearchResult) => void;
  onFavourite?: (food: FoodSearchResult) => void;
  isFavourited?: boolean;
  compact?: boolean;
}

export function FoodCard({
  food,
  onSelect,
  onFavourite,
  isFavourited,
  compact = false,
}: FoodCardProps) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-3 py-3",
        !compact && "px-4 bg-white",
        onSelect && "cursor-pointer active:bg-gray-50"
      )}
      onClick={() => onSelect?.(food)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-gray-900 text-sm leading-snug">
            {food.name}
          </span>
          {food.requiresVariationWarning && (
            <AlertTriangle
              size={13}
              className="text-amber-500 shrink-0"
              title="Calories may vary with recipe"
            />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">
            {SOURCE_DISPLAY_LABELS[food.sourceType] ?? food.sourceType}
          </span>
          {food.defaultServingName && (
            <span className="text-xs text-gray-400">
              · {food.defaultServingName} ({food.defaultServingWeightG}g)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {Math.round(food.caloriesPer100g)}
          </p>
          <p className="text-xs text-gray-400">kcal/100g</p>
        </div>

        {onFavourite && (
          <button
            className="p-1 rounded-full touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              onFavourite(food);
            }}
          >
            <Star
              size={18}
              className={
                isFavourited ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }
            />
          </button>
        )}
      </div>
    </div>
  );
}
