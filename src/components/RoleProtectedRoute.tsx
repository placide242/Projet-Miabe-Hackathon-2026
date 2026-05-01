import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles, AppRole } from "@/hooks/useUserRole";
import { usePermissions, AppPermission } from "@/hooks/usePermissions";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  requiredRole?: AppRole;
  anyOf?: AppRole[];
  requiredPermission?: AppPermission;
}

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-warm">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const RoleProtectedRoute = ({ children, requiredRole, anyOf, requiredPermission }: Props) => {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading } = useUserRoles();
  const { can, loading: permLoading } = usePermissions();

  if (authLoading || loading || permLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  let allowed = true;
  if (requiredPermission) allowed = can(requiredPermission);
  else if (anyOf) allowed = anyOf.some((r) => roles.includes(r));
  else if (requiredRole) allowed = roles.includes(requiredRole) || roles.includes("admin");

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm p-4">
        <Card className="max-w-md w-full border-0 shadow-card">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="font-display text-xl font-bold">Accès restreint</h1>
            <p className="text-sm text-muted-foreground">
              Cette page est réservée aux utilisateurs autorisés
              {requiredPermission ? ` (permission requise : ${requiredPermission})` : ""}.
            </p>
            <Button asChild variant="hero" className="w-full">
              <Link to="/dashboard">Retour au tableau de bord</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
