import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRole";

export type AppPermission =
  | "admin.view"
  | "admin.export_data"
  | "users.manage"
  | "roles.manage"
  | "content.moderate"
  | "transactions.view_all"
  | "credits.approve"
  | "microfinance.manage";

export const usePermissions = () => {
  const { user } = useAuth();
  const { roles, loading: rolesLoading } = useUserRoles();
  const [matrix, setMatrix] = useState<Record<string, AppPermission[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("role_permissions")
      .select("role,permission")
      .then(({ data }) => {
        if (!active) return;
        const m: Record<string, AppPermission[]> = {};
        (data ?? []).forEach((r: any) => {
          m[r.role] = m[r.role] || [];
          m[r.role].push(r.permission as AppPermission);
        });
        setMatrix(m);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const myPermissions = new Set<AppPermission>();
  roles.forEach((r) => (matrix[r] || []).forEach((p) => myPermissions.add(p)));

  const can = (perm: AppPermission) => myPermissions.has(perm);

  return {
    can,
    permissions: Array.from(myPermissions),
    matrix,
    loading: loading || rolesLoading,
    isAuthenticated: !!user,
  };
};
