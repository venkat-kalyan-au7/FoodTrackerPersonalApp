import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2, CheckCircle2, AlertCircle, Search, X } from "lucide-react";
import { useCreateRecipe, useExtractIngredients } from "../hooks/useRecipes";
import { useFoodSearch, useEstimateFood } from "../hooks/useFoods";
import { FoodSearchResult } from "@food-tracker/shared";
import toast from "react-hot-toast";

const ingredientSchema = z.object({
  foodId: z.string().min(1, "Select a food"),
  foodName: z.string(),
  weightG: z.number().min(1, "Enter weight"),
  caloriesPer100g: z.number().optional(),
});

const recipeSchema = z.object({
  name: z.string().min(2, "Recipe name required"),
  description: z.string().optional(),
  finalWeightG: z.number().min(10, "Enter final weight"),
  servings: z.number().min(1).optional(),
  ingredients: z.array(ingredientSchema).min(1, "Add at least one ingredient"),
});

type RecipeForm = z.infer<typeof recipeSchema>;

export function CreateRecipePage() {
  const navigate = useNavigate();
  const createRecipe = useCreateRecipe();
  const extractIngredients = useExtractIngredients();
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [activeIngredientIndex, setActiveIngredientIndex] = useState<number | null>(null);
  const [extractText, setExtractText] = useState("");
  const [showExtract, setShowExtract] = useState(false);

  const { data: searchResults } = useFoodSearch(ingredientQuery, ingredientQuery.length > 0);
  const estimateFood = useEstimateFood();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RecipeForm>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: "",
      finalWeightG: 400,
      servings: 4,
      ingredients: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  // Live values for calorie calculation and state detection
  const watchedIngredients = useWatch({ control, name: "ingredients" }) ?? [];

  const matchedCount = watchedIngredients.filter((i) => i?.foodId).length;
  const unmatchedCount = watchedIngredients.filter((i) => i?.foodName && !i?.foodId).length;
  const estimatedTotal = watchedIngredients.reduce((sum, ing) => {
    if (ing?.caloriesPer100g && ing?.weightG) {
      return sum + Math.round((ing.weightG / 100) * ing.caloriesPer100g);
    }
    return sum;
  }, 0);

  const onSubmit = async (values: RecipeForm) => {
    const missing = values.ingredients.filter((i) => !i.foodId);
    if (missing.length > 0) {
      toast.error(`"${missing[0].foodName || "An ingredient"}" still needs to be linked. Tap it to search.`);
      return;
    }
    await createRecipe.mutateAsync({
      name: values.name,
      description: values.description,
      finalWeightG: values.finalWeightG,
      servings: values.servings,
      ingredients: values.ingredients.map((i) => ({
        foodId: i.foodId,
        weightG: i.weightG,
      })),
    });
    navigate("/recipes");
  };

  const handleEstimateIngredient = async (index: number) => {
    if (!ingredientQuery.trim()) return;
    try {
      const food = await estimateFood.mutateAsync(ingredientQuery.trim());
      handlePickFood(food, index);
    } catch (err: unknown) {
      const serverMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(serverMsg ?? "AI estimation failed. Please try again.");
    }
  };

  const handlePickFood = (food: FoodSearchResult, index: number) => {
    setValue(`ingredients.${index}.foodId`, food.id);
    setValue(`ingredients.${index}.foodName`, food.name);
    setValue(`ingredients.${index}.caloriesPer100g`, food.caloriesPer100g ?? undefined);
    setIngredientQuery("");
    setActiveIngredientIndex(null);
    toast.success(`${food.name} linked!`, { duration: 1500 });
  };

  const handleAddBlankIngredient = () => {
    const newIndex = fields.length;
    append({ foodId: "", foodName: "", weightG: 100, caloriesPer100g: undefined });
    setActiveIngredientIndex(newIndex);
  };

  const handleCancelSearch = (index: number) => {
    setIngredientQuery("");
    setActiveIngredientIndex(null);
    const ing = watchedIngredients[index];
    // Remove the row entirely if it was never linked to any food
    if (!ing?.foodName && !ing?.foodId) {
      remove(index);
    }
  };

  const handleExtract = async () => {
    if (!extractText.trim()) return;
    try {
      const result = await extractIngredients.mutateAsync({ text: extractText });
      for (const item of result.ingredients ?? []) {
        const weightG = item.unit?.toLowerCase() === "g" ? item.quantity : item.quantity;
        append({ foodId: "", foodName: item.name ?? item.foodName ?? "", weightG: weightG ?? 100, caloriesPer100g: undefined });
      }
      if (result.recipeName) {
        setValue("name", result.recipeName);
      }
      setShowExtract(false);
      setExtractText("");
      toast.success(`${result.ingredients?.length ?? 0} ingredients extracted! Link each one below.`);
    } catch {
      // error handled in hook
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
          <h1 className="text-base font-semibold text-gray-900">New Recipe</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-40 space-y-4">
        {/* Basic info */}
        <div className="card space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Recipe Name *
            </label>
            <input
              className="input-field"
              placeholder="e.g. Amma's Dal Tadka"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Description (optional)
            </label>
            <textarea
              className="input-field min-h-[72px] resize-none"
              placeholder="Notes about this recipe..."
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Final weight (g) *
              </label>
              <input
                type="number"
                inputMode="numeric"
                className="input-field"
                {...register("finalWeightG", { valueAsNumber: true })}
              />
              {errors.finalWeightG && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.finalWeightG.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Servings
              </label>
              <input
                type="number"
                inputMode="numeric"
                className="input-field"
                {...register("servings", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-800">Ingredients</h3>
              {fields.length > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {matchedCount} linked
                  {unmatchedCount > 0 && (
                    <span className="text-amber-500"> · {unmatchedCount} need linking</span>
                  )}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowExtract(!showExtract)}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 py-1 px-2 rounded-lg bg-primary-50"
            >
              <Sparkles size={13} />
              AI Extract
            </button>
          </div>

          {/* AI Extract panel */}
          {showExtract && (
            <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
              <p className="text-xs font-medium text-purple-700">
                Paste a recipe description — AI will extract the ingredients for you
              </p>
              <textarea
                className="input-field min-h-[80px] resize-none text-sm"
                placeholder="e.g. '2 cups rice, 1 cup toor dal, 2 tbsp ghee, salt to taste'"
                value={extractText}
                onChange={(e) => setExtractText(e.target.value)}
              />
              <button
                type="button"
                onClick={handleExtract}
                disabled={extractIngredients.isPending}
                className="btn-primary text-sm py-2"
              >
                {extractIngredients.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Extracting...
                  </span>
                ) : (
                  "Extract Ingredients"
                )}
              </button>
            </div>
          )}

          {errors.ingredients && (
            <p className="text-xs text-red-500 mb-2">
              {errors.ingredients.message ?? (errors.ingredients as { root?: { message: string } })?.root?.message}
            </p>
          )}

          {/* Empty state */}
          {fields.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No ingredients yet</p>
              <p className="text-xs mt-1">Tap "Add ingredient" below to start building your recipe</p>
            </div>
          )}

          {/* Ingredient cards */}
          <div className="space-y-2">
            {fields.map((field, index) => {
              const isActive = activeIngredientIndex === index;
              const watchedIng = watchedIngredients[index];
              const isMatched = !!watchedIng?.foodId;
              const hasName = !!watchedIng?.foodName;
              const calculatedKcal =
                watchedIng?.caloriesPer100g && watchedIng?.weightG
                  ? Math.round((watchedIng.weightG / 100) * watchedIng.caloriesPer100g)
                  : null;

              return (
                <div
                  key={field.id}
                  className={`rounded-xl border transition-all ${
                    isActive
                      ? "border-primary-300 bg-primary-50"
                      : isMatched
                      ? "border-green-200 bg-green-50"
                      : hasName
                      ? "border-amber-200 bg-amber-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {/* Food name / search row */}
                  <div className="px-3 pt-3">
                    {isActive ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="search"
                              className="input-field text-sm py-2 pl-9 pr-3"
                              placeholder="Search food..."
                              value={ingredientQuery}
                              onChange={(e) => setIngredientQuery(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCancelSearch(index)}
                            className="p-1.5 text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* AI estimate — always shown when query is typed */}
                        {ingredientQuery.trim().length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEstimateIngredient(index)}
                            disabled={estimateFood.isPending}
                            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-xs shadow-sm active:opacity-90"
                          >
                            {estimateFood.isPending
                              ? <><Loader2 size={13} className="animate-spin" /> Estimating with AI…</>
                              : <><Sparkles size={13} /> Estimate "{ingredientQuery}" with AI</>}
                          </button>
                        )}

                        {/* Search results dropdown */}
                        {searchResults && searchResults.length > 0 && (
                          <div className="mt-1.5 border border-gray-200 rounded-xl overflow-hidden shadow-md max-h-48 overflow-y-auto bg-white">
                            {ingredientQuery.trim().length > 0 && (
                              <p className="text-[10px] font-semibold text-gray-400 px-3 py-1.5 uppercase tracking-wide bg-gray-50">
                                Search results
                              </p>
                            )}
                            {searchResults.map((food) => (
                              <button
                                key={food.id}
                                type="button"
                                onClick={() => handlePickFood(food, index)}
                                className="w-full text-left px-3 py-2.5 hover:bg-primary-50 border-b border-gray-50 last:border-0 transition-colors"
                              >
                                <div className="text-sm font-medium text-gray-900">{food.name}</div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {food.caloriesPer100g} kcal · {food.proteinPer100g}g protein · {food.carbsPer100g}g carbs per 100g
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {ingredientQuery.length > 1 && (!searchResults || searchResults.length === 0) && (
                          <p className="text-xs text-gray-400 mt-1.5 px-1">No results — try a different name or use AI above</p>
                        )}
                      </div>
                    ) : isMatched ? (
                      /* Matched ingredient */
                      <button
                        type="button"
                        onClick={() => {
                          setIngredientQuery(watchedIng?.foodName ?? "");
                          setActiveIngredientIndex(index);
                        }}
                        className="flex items-center gap-2 w-full text-left"
                      >
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-900 flex-1 leading-snug">
                          {watchedIng?.foodName}
                        </span>
                        <span className="text-xs text-gray-400">tap to change</span>
                      </button>
                    ) : hasName ? (
                      /* AI-extracted but not yet linked */
                      <button
                        type="button"
                        onClick={() => {
                          setIngredientQuery(watchedIng?.foodName ?? "");
                          setActiveIngredientIndex(index);
                        }}
                        className="flex items-center gap-2 w-full text-left"
                      >
                        <AlertCircle size={16} className="text-amber-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-amber-800 block truncate">
                            {watchedIng?.foodName}
                          </span>
                          <span className="text-xs text-amber-500">Tap to find in database</span>
                        </div>
                      </button>
                    ) : (
                      /* Blank row — shouldn't usually be visible, but just in case */
                      <button
                        type="button"
                        onClick={() => setActiveIngredientIndex(index)}
                        className="flex items-center gap-2 text-primary-600 text-sm font-medium"
                      >
                        <Search size={15} />
                        Search food...
                      </button>
                    )}
                  </div>

                  {/* Weight + kcal badge + delete */}
                  <div className="flex items-center gap-2 px-3 pb-3 mt-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="number"
                        inputMode="decimal"
                        className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="100"
                        {...register(`ingredients.${index}.weightG`, {
                          valueAsNumber: true,
                        })}
                      />
                      <span className="text-sm text-gray-500 font-medium">g</span>
                      {calculatedKcal !== null && (
                        <span className="ml-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          {calculatedKcal} kcal
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        remove(index);
                        if (activeIngredientIndex === index) setActiveIngredientIndex(null);
                      }}
                      className="p-1.5 text-gray-300 hover:text-red-400 active:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running total */}
          {matchedCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {matchedCount} ingredient{matchedCount !== 1 ? "s" : ""} linked
                {unmatchedCount > 0 && ` · ${unmatchedCount} unlinked`}
              </span>
              {estimatedTotal > 0 && (
                <span className="text-sm font-semibold text-gray-800">
                  ~{estimatedTotal} kcal total
                </span>
              )}
            </div>
          )}

          {/* Add ingredient button */}
          <button
            type="button"
            onClick={handleAddBlankIngredient}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-primary-200 text-primary-600 text-sm font-medium hover:bg-primary-50 active:bg-primary-100 transition-colors"
          >
            <Plus size={16} />
            Add ingredient
          </button>
        </div>
      </div>

      {/* Save button — sits above the bottom nav (bottom-16) */}
      <div className="fixed bottom-16 inset-x-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || createRecipe.isPending}
          className="btn-primary"
        >
          {isSubmitting || createRecipe.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </span>
          ) : fields.length > 0 ? (
            `Save Recipe · ${fields.length} ingredient${fields.length !== 1 ? "s" : ""}`
          ) : (
            "Save Recipe"
          )}
        </button>
      </div>
    </div>
  );
}
