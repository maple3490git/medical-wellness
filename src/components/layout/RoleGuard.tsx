"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Permission } from "@/lib/types";
import { Lock } from "lucide-react";

interface RoleGuardProps {
  permission?: Permission;
  anyOf?: Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

export default function RoleGuard({ permission, anyOf, fallback, children }: RoleGuardProps) {
  const { user, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const allowed = permission ? hasPermission(permission) : anyOf ? anyOf.some((p) => hasPermission(p)) : true;

  if (!allowed) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--surface-soft))] flex items-center justify-center text-[rgb(var(--text-muted))] mb-4">
          <Lock size={24} />
        </div>
        <h2 className="font-display text-xl font-semibold">Accès restreint</h2>
        <p className="text-sm text-[rgb(var(--text-muted))] mt-1 max-w-sm">
          Vous n'avez pas les permissions nécessaires pour consulter cette page.
        </p>
        <button onClick={() => router.push("/dashboard")} className="btn-gold mt-5">
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return <>{children}</>;
}