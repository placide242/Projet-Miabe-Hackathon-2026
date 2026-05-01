import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "moderator" | "agent" | "user";

export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active) return;
        setRoles((data ?? []).map((r: any) => r.role as AppRole));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator") || isAdmin;
  const isAgent = roles.includes("agent") || isAdmin;

  return { roles, loading, hasRole, isAdmin, isModerator, isAgent };
};
