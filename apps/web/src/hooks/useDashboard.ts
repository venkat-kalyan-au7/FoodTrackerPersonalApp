import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { DashboardData, WeeklySummary } from "@food-tracker/shared";
import { format } from "date-fns";

export function useDashboard(date?: string) {
  const today = date ?? format(new Date(), "yyyy-MM-dd");
  return useQuery<DashboardData>({
    queryKey: ["dashboard", today],
    queryFn: async () => {
      const { data } = await apiClient.get(`/dashboard?date=${today}`);
      return data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useWeeklySummary(startDate?: string) {
  const defaultStart = format(
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd"
  );
  return useQuery<WeeklySummary>({
    queryKey: ["weekly", startDate ?? defaultStart],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/dashboard/weekly?startDate=${startDate ?? defaultStart}`
      );
      return data.data;
    },
  });
}
