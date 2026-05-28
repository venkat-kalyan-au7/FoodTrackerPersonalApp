import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import toast from "react-hot-toast";
import { CardSkeleton } from "../components/SkeletonLoader";

const goalSchema = z.object({
  dailyCalorieGoal: z.number().min(500).max(10000),
});

type GoalForm = z.infer<typeof goalSchema>;

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const qc = useQueryClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    values: { dailyCalorieGoal: profile?.dailyCalorieGoal ?? 2000 },
  });

  const updateGoal = useMutation({
    mutationFn: async (values: GoalForm) => {
      const today = new Date().toISOString().split("T")[0];
      await apiClient.post("/profile/calorie-goals", {
        calorieGoal: values.dailyCalorieGoal,
        effectiveFrom: today,
      });
    },
    onSuccess: () => {
      toast.success("Calorie goal updated!");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Failed to update goal"),
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-100 px-4 pt-safe">
        <div className="flex items-center justify-between h-14">
          <h1 className="text-lg font-bold text-gray-900">Profile</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 text-sm text-red-500 font-medium"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* User info */}
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-700">
                    {(profile?.displayName ?? user?.email ?? "U")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {profile?.displayName ?? "User"}
                  </p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>
              {profile?.role === "ADMIN" && (
                <div className="mt-3">
                  <button
                    onClick={() => navigate("/admin")}
                    className="text-sm text-primary-600 font-medium"
                  >
                    → Admin Panel
                  </button>
                </div>
              )}
            </div>

            {/* Calorie goal */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3">Daily Calorie Goal</h3>
              <form onSubmit={handleSubmit((v) => updateGoal.mutate(v))} className="space-y-3">
                <div>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="input-field text-2xl font-bold text-center"
                    {...register("dailyCalorieGoal", { valueAsNumber: true })}
                  />
                  {errors.dailyCalorieGoal && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.dailyCalorieGoal.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 text-center mt-1">kcal per day</p>
                </div>

                {/* Quick presets */}
                <div className="flex gap-2 justify-center flex-wrap">
                  {[1200, 1500, 1800, 2000, 2200, 2500].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        handleSubmit((v) => updateGoal.mutate({ ...v, dailyCalorieGoal: g }))()
                      }
                      className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full"
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || updateGoal.isPending}
                  className="btn-primary"
                >
                  {updateGoal.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Goal"
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
