import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { homeForRole } from "@/lib/roles";

export function NotAuthorized({ message }) {
  const { user } = useAuth();
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft text-warning">
        <ShieldAlert className="h-6 w-6" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold text-forest">You do not have access to this area</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {message || "This workspace is limited to authorised roles. If you believe you need access, contact an AMANA administrator."}
      </p>
      <Button asChild className="mt-6">
        <Link to={homeForRole(user)}>Back to my dashboard</Link>
      </Button>
    </div>
  );
}

export default function RequireRole({ allow, children, message }) {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  const role = user?.role || "user";
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold text-forest">Sign in required</h1>
        <p className="mt-2 text-sm text-muted-foreground">This area is only available to signed-in accounts.</p>
        <Button asChild className="mt-6"><Link to="/login">Log in</Link></Button>
      </div>
    );
  }
  if (allow && !allow.includes(role)) return <NotAuthorized message={message} />;
  return children;
}