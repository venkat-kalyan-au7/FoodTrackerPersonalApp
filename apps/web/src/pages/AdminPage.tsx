import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Users } from "lucide-react";
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
