import { ReactNode } from "react";
import { usePermissions, AppPermission } from "@/hooks/usePermissions";

interface Props {
  permission: AppPermission;
  children: ReactNode;
  fallback?: ReactNode;
}

/** Conditionally renders children only if the current user has the permission. */
const Can = ({ permission, children, fallback = null }: Props) => {
  const { can, loading } = usePermissions();
  if (loading) return null;
  return <>{can(permission) ? children : fallback}</>;
};

export default Can;
