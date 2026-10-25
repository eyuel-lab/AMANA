import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/lib/AuthContext";
import useProfile from "@/hooks/useProfile";
import { navSections } from "@/components/app/navItems";
import { initials } from "@/lib/format";
import { ROLE_LABEL, roleOf } from "@/lib/roles";

function SidebarBody({ user, profile, onNavigate }) {
  const sections = navSections(user, profile);
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Logo tone="light" to="/buyer/dashboard" />
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/35">{section.title}</p>
            <nav className="space-y-0.5" aria-label={section.title}>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors ${
                      isActive ? "bg-sidebar-accent font-medium text-ivory" : "text-ivory/65 hover:bg-sidebar-accent/60 hover:text-ivory"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>
      <div className="border-t border-ivory/10 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-[12px] font-semibold text-gold">
            {initials(user?.full_name || user?.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ivory">{user?.full_name || "AMANA member"}</p>
            <p className="truncate text-[11px] text-ivory/45">{ROLE_LABEL[roleOf(user)]}</p>
          </div>
        </div>
        <Link to="/" className="mt-3 flex items-center gap-2 rounded-lg px-1 py-1.5 text-[12px] text-ivory/55 hover:text-ivory">
          <ExternalLink className="h-3.5 w-3.5" /> View public site
        </Link>
      </div>
    </div>
  );
}

export default function AppShell() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-[258px] shrink-0 bg-forest-deep lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarBody user={user} profile={profile} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border/80 bg-background/90 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-forest"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo compact />
          <span className="w-10" />
        </header>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" className="absolute inset-0 bg-forest-deep/60" aria-label="Close navigation" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[280px] bg-forest-deep shadow-2xl">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-ivory/70 hover:bg-sidebar-accent"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarBody user={user} profile={profile} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div key={location.pathname} className="mx-auto w-full max-w-[1180px] animate-rise">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-border/70 px-4 py-5 text-[12px] text-muted-foreground sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-forest" /> AMANA records are privately issued, not government documents.</span>
            <LogoutLink />
          </div>
        </footer>
      </div>
    </div>
  );
}

function LogoutLink() {
  const { logout } = useAuth();
  return (
    <button type="button" onClick={() => logout(true)} className="inline-flex items-center gap-1.5 text-forest hover:underline">
      <LogOut className="h-3.5 w-3.5" /> Log out
    </button>
  );
}