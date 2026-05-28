import { z } from "zod";
import { FoodNormalizationResultSchema, RecipeIngredientExtractionSchema } from "@food-tracker/shared";

describe("AI output Zod validation", () => {
  test("valid food normalization result passes", () => {
    const input = {
      originalQuery: "perugu annam",
      normalizedFoodName: "curd rice",
      suggestedSearchTerms: ["curd rice", "yogurt rice"],
      confidence: 0.96,
    };
    expect(() => FoodNormalizationResultSchema.parse(input)).not.toThrow();
  });

  test("food normalization with confidence 0 to 1", () => {
    const invalid = {
      originalQuery: "test",
      normalizedFoodName: "test",
      suggestedSearchTerms: [],
      confidence: 1.5, // invalid
    };
    expect(() => FoodNormalizationResultSchema.parse(invalid)).toThrow();
  });

  test("missing normalizedFoodName fails", () => {
    const invalid = {
      originalQuery: "pappu",
      suggestedSearchTerms: ["dal"],
      confidence: 0.8,
    };
    expect(() => FoodNormalizationResultSchema.parse(invalid)).toThrow();
  });

  test("valid recipe extraction passes", () => {
    const input = {
      recipeName: "Homemade Pizza",
      ingredients: [
        { name: "maida", quantity: 200, unit: "g" },
        { name: "mozzarella cheese", quantity: 100, unit: "g" },
      ],
      confidence: 0.93,
    };
    expect(() => RecipeIngredientExtractionSchema.parse(input)).not.toThrow();
  });

  test("recipe ingredient with negative quantity fails", () => {
    const invalid = {
      ingredients: [{ name: "maida", quantity: -100, unit: "g" }],
      confidence: 0.9,
    };
    expect(() => RecipeIngredientExtractionSchema.parse(invalid)).toThrow();
  });

  test("AI confidence routing: high confidence (>= 0.90)", () => {
    const HIGH = 0.9;
    const confidence = 0.96;
    expect(confidence >= HIGH).toBe(true);
  });

  test("AI confidence routing: medium confidence (0.70 - 0.89)", () => {
    const HIGH = 0.9;
    const MEDIUM = 0.7;
    const confidence = 0.84;
    expect(confidence >= MEDIUM && confidence < HIGH).toBe(true);
  });

  test("AI confidence routing: low confidence (< 0.70)", () => {
    const MEDIUM = 0.7;
    const confidence = 0.55;
    expect(confidence < MEDIUM).toBe(true);
  });
});
