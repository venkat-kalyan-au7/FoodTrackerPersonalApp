import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { FoodSearchResult } from "@food-tracker/shared";
import toast from "react-hot-toast";

export function useFavourites() {
  return useQuery<FoodSearchResult[]>({
    queryKey: ["favourites"],
    queryFn: async () => {
      const { data } = await apiClient.get("/favourites");
      return data.data;
    },
  });
}

export function useAddFavourite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (foodId: string) => {
      await apiClient.post(`/favourites/${foodId}`);
    },
    onSuccess: () => {
      toast.success("Added to favourites");
      qc.invalidateQueries({ queryKey: ["favourites"] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 409) {
        toast.error("Already in favourites");
      } else {
        toast.error("Failed to add favourite");
      }
    },
  });
}

export function useRemoveFavourite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (foodId: string) => {
      await apiClient.delete(`/favourites/${foodId}`);
    },
    onSuccess: () => {
      toast.success("Removed from favourites");
      qc.invalidateQueries({ queryKey: ["favourites"] });
    },
  });
}
