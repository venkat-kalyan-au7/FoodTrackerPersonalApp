export const AI_PROMPTS = {
  NORMALIZE_FOOD_NAME: (query: string) => `
You are a nutrition assistant specialized in Indian and South Indian cuisine.

A user searched for: "${query}"

Your task is to normalize this food name for searching a nutrition database.

Common Telugu/South Indian to English translations:
- pappu, mudda pappu -> dal / cooked dal
- perugu annam, perugu sadam -> curd rice / yogurt rice  
- annam, sadam -> cooked rice / white rice
- pesarattu -> green gram dosa / moong dal dosa
- pulihora, chitrannam -> tamarind rice
- uppittu, upma -> upma / semolina porridge
- garelu -> medu vada
- majjiga -> buttermilk
- perugu -> curd / yogurt
- sambar sadam -> sambar rice
- roti, chapathi -> chapati

Return ONLY a valid JSON object with no markdown, no explanation, just JSON:
{
  "originalQuery": "${query}",
  "normalizedFoodName": "<best single English food name>",
  "suggestedSearchTerms": ["<term1>", "<term2>"],
  "confidence": <0.0 to 1.0>
}

Rules:
- confidence >= 0.90 means very clear match
- confidence 0.70-0.89 means likely match, user should confirm
- confidence < 0.70 means uncertain
- suggestedSearchTerms should have 1-3 terms maximum
- If query is already clear English, return it normalized with high confidence
`,

  EXTRACT_RECIPE_INGREDIENTS: (input: string) => `
You are a recipe parsing assistant.

Extract all ingredients from this recipe description:
"${input}"

Convert measurements to grams or ml where possible:
- 1 tbsp oil ≈ 14g
- 1 tsp ≈ 5g  
- 1 cup flour ≈ 120g
- 1 cup rice (uncooked) ≈ 185g
- 1 cup liquid ≈ 240ml

Return ONLY a valid JSON object with no markdown, no explanation, just JSON:
{
  "recipeName": "<recipe name if mentioned, otherwise null>",
  "ingredients": [
    {
      "name": "<ingredient name in English>",
      "quantity": <numeric value>,
      "unit": "<g|ml|tbsp|tsp|cup|piece|nos>"
    }
  ],
  "confidence": <0.0 to 1.0>
}

Rules:
- Use common English names for ingredients
- If a measurement is ambiguous, use your best estimate and lower confidence
- confidence >= 0.90 means all ingredients clearly identified
- confidence < 0.70 means some ingredients are ambiguous
`,

  ESTIMATE_FOOD_NUTRITION: (query: string) => `
You are a nutrition scientist with deep expertise in Indian, South Indian, and global cuisines.

Estimate the nutritional content PER 100 GRAMS for: "${query}"

Use USDA FoodData Central, NIN India (National Institute of Nutrition), and IFCT (Indian Food Composition Tables) as your knowledge base.

Return ONLY a valid JSON object with no markdown, no explanation, just JSON:
{
  "foodName": "<clean canonical English food name>",
  "caloriesPer100g": <number>,
  "proteinPer100g": <number>,
  "carbsPer100g": <number>,
  "fatPer100g": <number>,
  "fiberPer100g": <number>,
  "defaultServingWeightG": <number or null>,
  "confidence": <0.0 to 1.0>
}

Rules:
- All numeric values must be actual numbers (never null)
- Use typical home-cooked values for Indian dishes
- confidence >= 0.85: well-known food with reliable data
- confidence 0.65-0.84: reasonable estimate, may vary
- confidence < 0.65: highly variable dish (curries, restaurant food)
- defaultServingWeightG: typical single serving weight in grams (e.g., 40 for one chapati, 150 for dal, 50 for one samosa)
- If the query includes a quantity like "2 samosas", set defaultServingWeightG to weight of ONE piece
`,
};
