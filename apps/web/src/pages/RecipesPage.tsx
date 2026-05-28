import { Link } from "react-router-dom";
import { Plus, BookOpen, Trash2, ChevronRight, Utensils } from "lucide-react";
import { useRecipes, useDeleteRecipe } from "../hooks/useRecipes";
import { SkeletonLoader } from "../components/SkeletonLoader";
import { EmptyState } from "../components/EmptyState";

export function RecipesPage() {
  const { data: recipes, isLoading } = useRecipes();
  const deleteRecipe = useDeleteRecipe();

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) return;
    deleteRecipe.mutate(id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-safe">
        <div className="flex items-center justify-between h-14">
          <h1 className="text-lg font-bold text-gray-900">My Recipes</h1>
          <Link
            to="/recipes/new"
            className="flex items-center gap-1 text-primary-600 font-semibold text-sm"
          >
            <Plus size={18} />
            New
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 space-y-2">
        {isLoading ? (
          <SkeletonLoader rows={4} />
        ) : (recipes ?? []).length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No recipes yet"
            description="Build a custom recipe from ingredients and track its exact calories &amp; macros."
            action={
              <Link
                to="/recipes/new"
                className="btn-primary"
                style={{ width: "auto", paddingInline: "24px" }}
              >
                Create Recipe
              </Link>
            }
          />
        ) : (
          recipes!.map((recipe) => (
            <div key={recipe.id} className="card">
              {/* Top row: name + delete */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 leading-snug">
                    {recipe.recipeName}
                  </p>
                  {recipe.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(recipe.id, recipe.recipeName)}
                  disabled={deleteRecipe.isPending}
                  className="p-1.5 text-gray-300 active:text-red-500 rounded-full touch-manipulation shrink-0"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              {/* Nutrition summary row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-gray-500">
                <span className="font-semibold text-primary-600">
                  {Math.round(recipe.totalCalories)} kcal total
                </span>
                {recipe.caloriesPer100g != null && (
                  <span>{Math.round(recipe.caloriesPer100g)} kcal/100g</span>
                )}
                {recipe.caloriesPerServing != null && (
                  <span>{Math.round(recipe.caloriesPerServing)} kcal/serving</span>
                )}
                {recipe.servings != null && (
                  <span>{recipe.servings} servings</span>
                )}
              </div>

              {/* Action row */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                {recipe.foodId && (
                  <Link
                    to={`/add-food?foodId=${recipe.foodId}&source=recipe`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-semibold active:bg-primary-100"
                  >
                    <Utensils size={15} />
                    Log Recipe
                  </Link>
                )}
                <Link
                  to={`/recipes/${recipe.id}`}
                  className="flex items-center gap-1 text-sm text-gray-500 font-medium py-2 px-3 rounded-xl active:bg-gray-50"
                >
                  View
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
