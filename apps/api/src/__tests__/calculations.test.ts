describe("Calorie Calculation", () => {
  function calculateCalories(caloriesPer100g: number, consumedWeightG: number): number {
    return (caloriesPer100g * consumedWeightG) / 100;
  }

  function calculateRecipePer100g(totalCalories: number, finalWeightG: number): number {
    return (totalCalories * 100) / finalWeightG;
  }

  function calculateRecipePerServing(totalCalories: number, servings: number): number {
    return totalCalories / servings;
  }

  function calculateDailyRemaining(goal: number, consumed: number): number {
    return goal - consumed;
  }

  test("food by grams: dal makhani", () => {
    const result = calculateCalories(125, 150);
    expect(result).toBeCloseTo(187.5, 1);
  });

  test("food by grams: cooked rice", () => {
    const result = calculateCalories(130, 180);
    expect(result).toBeCloseTo(234, 1);
  });

  test("food by grams: idli 2 pieces at 40g each", () => {
    const result = calculateCalories(58, 80);
    expect(result).toBeCloseTo(46.4, 1);
  });

  test("recipe calories per 100g", () => {
    const result = calculateRecipePer100g(980, 420);
    expect(result).toBeCloseTo(233.33, 1);
  });

  test("recipe calories per serving", () => {
    const result = calculateRecipePerServing(980, 4);
    expect(result).toBe(245);
  });

  test("recipe ingredient contribution", () => {
    // Pizza: maida 200g at 364 kcal/100g
    const maida = calculateCalories(364, 200);
    expect(maida).toBeCloseTo(728, 1);
    // Cheese 100g at 402 kcal/100g
    const cheese = calculateCalories(402, 100);
    expect(cheese).toBeCloseTo(402, 1);
    // Total
    expect(maida + cheese).toBeCloseTo(1130, 1);
  });

  test("daily remaining calories", () => {
    const remaining = calculateDailyRemaining(1800, 1240);
    expect(remaining).toBe(560);
  });

  test("daily remaining when exceeded", () => {
    const remaining = calculateDailyRemaining(1800, 2100);
    expect(remaining).toBe(-300);
  });

  test("progress percentage caps at 100", () => {
    const consumed = 2200;
    const goal = 1800;
    const percentage = Math.min((consumed / goal) * 100, 100);
    expect(percentage).toBe(100);
  });
});
