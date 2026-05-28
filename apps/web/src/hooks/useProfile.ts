import { useQuery } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { UserProfile } from "@food-tracker/shared";

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await apiClient.get("/profile");
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
