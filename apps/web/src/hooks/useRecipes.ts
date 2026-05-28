import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { Recipe } from "@food-tracker/shared";
import toast from "react-hot-toast";

export function useRecipes() {
  return useQuery<Recipe[]>({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data } = await apiClient.get("/recipes");
      return data.data;
    },
  });
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/recipes/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post("/recipes", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Recipe saved!");
      qc.invalidateQueries({ queryKey: ["recipes"] });
    },
    onError: () => {
      toast.error("Failed to save recipe. Please try again.");
    },
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/recipes/${id}`);
    },
    onSuccess: () => {
      toast.success("Recipe deleted");
      qc.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useCalculateRecipe() {
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post("/recipes/calculate", payload);
      return data.data;
    },
  });
}

export function useExtractIngredients() {
  return useMutation({
    mutationFn: async (payload: { text: string; useAdvancedModel?: boolean }) => {
      const { data } = await apiClient.post(
        "/recipes/extract-ingredients",
        payload
      );
      return data.data;
    },
    onError: () => {
      toast.error("AI extraction failed. Please add ingredients manually.");
    },
  });
}
