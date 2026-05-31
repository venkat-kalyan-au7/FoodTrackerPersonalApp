export const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACKS"] as const;
export const USER_ROLES = ["ADMIN", "USER"] as const;
export const FOOD_TYPES = ["SYSTEM", "EXTERNAL", "USER_MANUAL", "RECIPE"] as const;
export const SOURCE_TYPES = [
  "INDIAN_REFERENCE",
  "USDA_FDC",
  "OPEN_FOOD_FACTS",
  "USER_MANUAL",
  "USER_RECIPE",
] as const;

export const AI_CONFIDENCE = {
  HIGH: 0.9,
  MEDIUM: 0.7,
} as const;

export const SOURCE_DISPLAY_LABELS: Record<string, string> = {
  INDIAN_REFERENCE: "Verified Indian Food",
  USDA_FDC: "USDA FoodData Central",
  OPEN_FOOD_FACTS: "Open Food Facts",
  USER_MANUAL: "Manual Entry",
  USER_RECIPE: "My Recipe",
  EXTERNAL: "External Nutrition Match",
  AI_ASSISTED: "AI-Assisted Name Match",
};

export const VARIATION_WARNING_MESSAGE =
  "This dish can vary significantly depending on oil, butter, cream, ingredients and preparation method. For better accuracy, create and save your own recipe.";

export const MAX_IMAGE_UPLOAD_MB = 2;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const FOODS_REQUIRING_VARIATION_WARNING = [
  "dal makhani",
  "paneer butter masala",
  "chicken biryani",
  "vegetable biryani",
  "curry",
  "fried rice",
  "pizza",
  "paratha",
  "masala dosa",
];
