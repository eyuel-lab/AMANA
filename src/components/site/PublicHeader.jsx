import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { homeForRole } from "@/lib/roles";

const LINKS = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/ownership-check", label: "Ownership check" },
  { to: "/protection/report", label: "Protection" },
  { to: "/help", label: "Help" },
];

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-colors ${scrolled ? "border-b border-border/80 bg-background/90 backdrop-blur-md" : "bg-transparent"}`}>
      <div className="container-page flex h-[74px] items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-forest" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2.5 lg:flex">
          {isAuthenticated ? (
            <Button asChild size="sm" className="rounded-full px-4">
              <Link to={homeForRole(user)}>
                <LayoutDashboard className="mr-1.5 h-4 w-4" /> Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-forest hover:bg-forest/5">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-forest px-5 text-ivory hover:bg-forest-deep">
                <Link to="/marketplace">Explore marketplace</Link>
              </Button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-forest lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="container-page space-y-1 py-4">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-forest hover:bg-secondary">
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-2 border-t border-border pt-3">
              {isAuthenticated ? (
                <Button asChild className="w-full"><Link to={homeForRole(user)}>Go to dashboard</Link></Button>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full"><Link to="/login">Log in</Link></Button>
                  <Button asChild className="w-full"><Link to="/marketplace">Explore marketplace</Link></Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}