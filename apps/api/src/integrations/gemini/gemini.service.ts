import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config/index.js";
import { AI_PROMPTS } from "./ai.prompts.js";
import {
  FoodNormalizationResultSchema,
  RecipeIngredientExtractionSchema,
  NutritionEstimateSchema,
} from "./ai.schemas.js";
import {
  FoodNormalizationResult,
  RecipeIngredientExtractionResult,
  NutritionEstimate,
} from "@food-tracker/shared";
import type { AiFoodMatchingService } from "./ai.interface.js";

const AI_TIMEOUT_MS = 10000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("AI request timed out")), ms)
  );
  return Promise.race([promise, timeout]);
}

function safeParseJson(text: string): unknown {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/im, "").replace(/\s*```$/im, "").trim();
  return JSON.parse(cleaned);
}

export class GeminiAiFoodMatchingService implements AiFoodMatchingService {
  private readonly client: GoogleGenerativeAI;

  constructor() {
    if (!config.ai.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    this.client = new GoogleGenerativeAI(config.ai.geminiApiKey);
  }

  private getModel(useAdvanced = false): string {
    return useAdvanced ? config.ai.advancedModel : config.ai.model;
  }

  async normalizeFoodName(query: string): Promise<FoodNormalizationResult> {
    const modelName = this.getModel(false);
    const model = this.client.getGenerativeModel({ model: modelName });
    const prompt = AI_PROMPTS.NORMALIZE_FOOD_NAME(query);

    const result = await withTimeout(
      model.generateContent(prompt),
      AI_TIMEOUT_MS
    );
    const text = result.response.text();

    const parsed = safeParseJson(text);
    const validated = FoodNormalizationResultSchema.parse(parsed);
    return validated;
  }

  async extractRecipeIngredients(
    input: string,
    useAdvancedModel = false
  ): Promise<RecipeIngredientExtractionResult> {
    const modelName = this.getModel(useAdvancedModel);
    const model = this.client.getGenerativeModel({ model: modelName });
    const prompt = AI_PROMPTS.EXTRACT_RECIPE_INGREDIENTS(input);

    const result = await withTimeout(
      model.generateContent(prompt),
      AI_TIMEOUT_MS
    );
    const text = result.response.text();

    const parsed = safeParseJson(text);
    const validated = RecipeIngredientExtractionSchema.parse(parsed);
    return validated;
  }

  async estimateFoodNutrition(query: string): Promise<NutritionEstimate> {
    const modelName = this.getModel(false);
    const model = this.client.getGenerativeModel({ model: modelName });
    const prompt = AI_PROMPTS.ESTIMATE_FOOD_NUTRITION(query);

    const result = await withTimeout(
      model.generateContent(prompt),
      AI_TIMEOUT_MS
    );
    const text = result.response.text();

    const parsed = safeParseJson(text);
    const validated = NutritionEstimateSchema.parse(parsed);
    return validated;
  }
}

// Lazy singleton
let _aiService: GeminiAiFoodMatchingService | null = null;

export function getAiService(): AiFoodMatchingService | null {
  if (!config.ai.enabled) return null;
  if (!config.ai.geminiApiKey) return null;

  if (!_aiService) {
    _aiService = new GeminiAiFoodMatchingService();
  }
  return _aiService;
}
