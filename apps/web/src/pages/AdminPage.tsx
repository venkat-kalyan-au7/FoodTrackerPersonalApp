import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Users, Sparkles, Database, Check, X } from "lucide-react";
import apiClient from "../lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { SkeletonLoader } from "../components/SkeletonLoader";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type InviteForm = z.infer<typeof inviteSchema>;

interface Invitation {
  id: string;
  invited_email: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
}

interface AiStats {
  sources: {
    aiEstimates:   { cached: number; keyConfigured: boolean };
    usda:          { cached: number; keyConfigured: boolean };
    openFoodFacts: { cached: number; keyConfigured: boolean };
    calorieNinja:  { cached: number; keyConfigured: boolean };
  };
  totalCachedFoods: number;
  gemini: {
    model: string;
    freeTierDailyLimit: number | null;
    keyConfigured: boolean;
    note: string;
  };
}

export function AdminPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
  });

  const { data: invitations, isLoading, refetch } = useQuery<Invitation[]>({
    queryKey: ["admin-invitations"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/invitations");
      return data.data;
    },
  });

  const { data: aiStats, isLoading: statsLoading } = useQuery<AiStats>({
    queryKey: ["admin-ai-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/ai-stats");
      return data.data;
    },
    refetchInterval: 60_000, // refresh every minute
  });

  const invite = useMutation({
    mutationFn: async ({ email }: InviteForm) => {
      await apiClient.post("/admin/invitations", { email });
    },
    onSuccess: () => {
      toast.success("Invitation sent!");
      reset();
      refetch();
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message ?? "Failed to send invitation");
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-100 px-4 pt-safe">
        <div className="h-14 flex items-center">
          <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">

        {/* AI & Data Sources Stats */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles size={16} className="text-primary-500" />
            AI &amp; Data Sources
          </h3>

          {statsLoading ? (
            <SkeletonLoader rows={3} />
          ) : aiStats ? (
            <>
              {/* Gemini model row */}
              <div className="bg-primary-50 rounded-xl px-4 py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary-700">Gemini AI Model</span>
                  <span className={`flex items-center gap-1 text-xs font-medium ${aiStats.gemini.keyConfigured ? "text-green-600" : "text-red-500"}`}>
                    {aiStats.gemini.keyConfigured ? <Check size={12} /> : <X size={12} />}
                    {aiStats.gemini.keyConfigured ? "Key set" : "No key"}
                  </span>
                </div>
                <p className="text-sm font-bold text-primary-800">{aiStats.gemini.model}</p>
                {aiStats.gemini.freeTierDailyLimit && (
                  <p className="text-xs text-primary-600">
                    Free tier: <span className="font-semibold">{aiStats.gemini.freeTierDailyLimit.toLocaleString()} requests / day</span>
                  </p>
                )}
                <p className="text-xs text-primary-500">{aiStats.gemini.note}</p>
              </div>

              {/* Cached count summary */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Database size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600">Total foods cached</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{aiStats.totalCachedFoods.toLocaleString()}</span>
              </div>

              {/* Per-source breakdown */}
              <div className="space-y-2">
                {[
                  { label: "AI Estimates (Gemini)", count: aiStats.sources.aiEstimates.cached, key: aiStats.sources.aiEstimates.keyConfigured, color: "text-violet-600", bg: "bg-violet-50" },
                  { label: "USDA FoodData Central", count: aiStats.sources.usda.cached, key: aiStats.sources.usda.keyConfigured, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Open Food Facts", count: aiStats.sources.openFoodFacts.cached, key: aiStats.sources.openFoodFacts.keyConfigured, color: "text-green-600", bg: "bg-green-50" },
                  { label: "CalorieNinja (Indian dishes)", count: aiStats.sources.calorieNinja.cached, key: aiStats.sources.calorieNinja.keyConfigured, color: "text-orange-600", bg: "bg-orange-50" },
                ].map(({ label, count, key, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl px-3 py-2 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center justify-center w-4 h-4 rounded-full ${key ? "bg-green-100" : "bg-red-100"}`}>
                        {key ? <Check size={10} className="text-green-600" /> : <X size={10} className="text-red-500" />}
                      </span>
                      <span className={`text-xs font-medium ${color}`}>{label}</span>
                    </div>
                    <span className={`text-sm font-bold ${color}`}>{count.toLocaleString()} cached</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">Could not load stats</p>
          )}
        </div>

        {/* Invite form */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Mail size={16} />
            Invite User
          </h3>
          <form
            onSubmit={handleSubmit((v) => invite.mutate(v))}
            className="space-y-3"
          >
            <div>
              <input
                type="email"
                inputMode="email"
                placeholder="user@example.com"
                className="input-field"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={invite.isPending}
              className="btn-primary"
            >
              {invite.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Invitation"
              )}
            </button>
          </form>
        </div>

        {/* Invitation list */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Users size={16} />
            Invitations
          </h3>
          {isLoading ? (
            <SkeletonLoader rows={3} />
          ) : (invitations ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No invitations yet
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {invitations!.map((inv) => (
                <div
                  key={inv.id}
                  className="py-3 flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{inv.invited_email}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(inv.created_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      inv.status === "ACCEPTED"
                        ? "bg-green-100 text-green-700"
                        : inv.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
