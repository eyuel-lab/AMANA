import { Link } from "react-router-dom";
import { MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

export default function VerifyAccount() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest"><MailCheck className="h-6 w-6" /></span>
      <h1 className="mt-5 font-display text-[32px] text-forest">Account verification</h1>
      <p className="mt-3 max-w-lg text-[14px] leading-7 text-muted-foreground">
        Email verification is handled by the AMANA sign-in provider when you register. If you never received the code, sign in and request a new one from the login screen.
      </p>

      {isAuthenticated ? (
        <div className="mt-7 w-full max-w-md rounded-xl border border-border bg-card p-5 text-left">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Signed in as</p>
          <p className="mt-1 text-[15px] font-medium text-forest">{user?.email}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-success"><ShieldCheck className="h-4 w-4" /> Your session is active and verified by the platform.</p>
          <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
            Account verification is separate from seller verification. Seller verification is reviewed by a person and requires documents.
          </p>
          <Button asChild size="sm" className="mt-4 bg-forest text-ivory hover:bg-forest-deep"><Link to="/seller/verification">Seller verification</Link></Button>
        </div>
      ) : (
        <div className="mt-6 flex gap-2">
          <Button asChild className="bg-forest text-ivory hover:bg-forest-deep"><Link to="/login">Log in</Link></Button>
          <Button asChild variant="outline" className="border-forest/25 text-forest"><Link to="/register">Create account</Link></Button>
        </div>
      )}
    </div>
  );
}