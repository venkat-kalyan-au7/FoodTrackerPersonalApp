import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { FoodSearchResult, FoodLog } from "@food-tracker/shared";
import toast from "react-hot-toast";

export function useFoodSearch(query: string, enabled = true) {
  return useQuery<FoodSearchResult[]>({
    queryKey: ["food-search", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const { data } = await apiClient.get(
        `/foods/search?q=${encodeURIComponent(query)}`
      );
      return data.data.results;
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 60 * 1000,
  });
}

export function useRecentFoods() {
  return useQuery<FoodSearchResult[]>({
    queryKey: ["recent-foods"],
    queryFn: async () => {
      const { data } = await apiClient.get("/foods/recent");
      return data.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useFoodLogs(date: string) {
  return useQuery<FoodLog[]>({
    queryKey: ["food-logs", date],
    queryFn: async () => {
      const { data } = await apiClient.get(`/food-logs?date=${date}`);
      return data.data;
    },
    staleTime: 15 * 1000,
  });
}

export function useLogFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      foodId: string;
      consumedDate: string;
      mealType: string;
      consumedWeightG?: number;
      servingQuantity?: number;
      note?: string;
    }) => {
      const { data } = await apiClient.post("/food-logs", payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Food logged successfully!");
      qc.invalidateQueries({ queryKey: ["food-logs", variables.consumedDate] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["recent-foods"] });
    },
    onError: () => {
      toast.error("Failed to log food. Please try again.");
    },
  });
}

export function useDeleteFoodLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; date: string }) => {
      await apiClient.delete(`/food-logs/${id}`);
    },
    onSuccess: (_, variables) => {
      toast.success("Entry removed");
      qc.invalidateQueries({ queryKey: ["food-logs", variables.date] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateFoodLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      consumedWeightG,
      mealType,
    }: {
      id: string;
      date: string;
      consumedWeightG: number;
      mealType: string;
    }) => {
      const { data } = await apiClient.patch(`/food-logs/${id}`, {
        consumedWeightG,
        mealType,
      });
      return data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Entry updated!");
      qc.invalidateQueries({ queryKey: ["food-logs", variables.date] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Failed to update entry"),
  });
}

export function useEstimateFood() {
  return useMutation({
    mutationFn: async (query: string): Promise<FoodSearchResult> => {
      const { data } = await apiClient.post("/foods/estimate", { query });
      return data.data as FoodSearchResult;
    },
  });
}
