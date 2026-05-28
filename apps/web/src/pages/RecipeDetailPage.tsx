import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Utensils, Trash2, ChefHat } from "lucide-react";
import { useRecipe, useDeleteRecipe } from "../hooks/useRecipes";
import { SkeletonLoader } from "../components/SkeletonLoader";

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useRecipe(id!);
  const deleteRecipe = useDeleteRecipe();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-100 px-4 pt-safe">
          <div className="flex items-center gap-3 h-14">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft size={22} className="text-gray-700" />
            </button>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="px-4 py-4">
          <SkeletonLoader rows={5} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-100 px-4 pt-safe">
          <div className="flex items-center gap-3 h-14">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft size={22} className="text-gray-700" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">Recipe</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-8 text-center">
          <div>
            <ChefHat size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Recipe not found</p>
            <button
              onClick={() => navigate("/recipes")}
              className="mt-4 text-primary-600 text-sm font-medium"
            >
              Back to Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { recipe, ingredients } = data as {
    recipe: import("@food-tracker/shared").Recipe;
    ingredients: import("@food-tracker/shared").RecipeIngredient[];
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${recipe.recipeName}"? This cannot be undone.`
    );
    if (!confirmed) return;
    deleteRecipe.mutate(recipe.id, {
      onSuccess: () => navigate("/recipes"),
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-safe">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft size={22} className="text-gray-700" />
            </button>
            <h1
              className="text-base font-semibold text-gray-900 truncate max-w-[200px]"
              title={recipe.recipeName}
            >
              {recipe.recipeName}
            </h1>
          </div>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 active:text-red-500 rounded-full"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-4">
        {/* Description */}
        {recipe.description && (
          <p className="text-sm text-gray-500 leading-relaxed">{recipe.description}</p>
        )}

        {/* Nutrition summary */}
        <div className="card">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Nutrition Summary
          </p>
          <div className="grid grid-cols-2 gap-3">
            <NutrCell label="Total Calories" value={`${Math.round(recipe.totalCalories)} kcal`} highlight />
            {recipe.caloriesPer100g != null && (
              <NutrCell label="Per 100g" value={`${Math.round(recipe.caloriesPer100g)} kcal`} />
            )}
            {recipe.caloriesPerServing != null && (
              <NutrCell label="Per Serving" value={`${Math.round(recipe.caloriesPerServing)} kcal`} />
            )}
            {recipe.finalWeightG != null && (
              <NutrCell label="Final Weight" value={`${recipe.finalWeightG} g`} />
            )}
            {recipe.servings != null && (
              <NutrCell label="Servings" value={String(recipe.servings)} />
            )}
          </div>
        </div>

        {/* Instructions */}
        {recipe.instructions && (
          <div className="card">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Instructions
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {recipe.instructions}
            </p>
          </div>
        )}

        {/* Ingredients */}
        <div className="card">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Ingredients ({ingredients.length})
          </p>
          {ingredients.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">No ingredients recorded.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {ingredients.map((ing) => (
                <div key={ing.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ing.ingredientNameSnapshot}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ing.weightG}g · {ing.caloriesPer100gSnapshot} kcal/100g
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 shrink-0">
                    {Math.round(ing.caloriesSnapshot)} kcal
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      {recipe.foodId && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-4 py-3 pb-safe">
          <Link
            to={`/add-food?foodId=${recipe.foodId}&source=recipe`}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Utensils size={18} />
            Log This Recipe
          </Link>
        </div>
      )}
    </div>
  );
}

function NutrCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
      <p className={`text-sm font-bold ${highlight ? "text-primary-600" : "text-gray-800"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
