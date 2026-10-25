import {
  LayoutDashboard, Heart, ShoppingCart, Package, ShieldCheck, Bell, Settings,
  Store, ListPlus, ClipboardList, BadgeCheck, BarChart3, Wallet, FileSearch,
  FolderLock, Layers, Users, Gavel, ScrollText, Plug, Search, Flag, FolderOpen,
} from "lucide-react";

export function navSections(user, profile) {
  const role = user?.role || "user";
  const types = Array.isArray(profile?.account_types) ? profile.account_types : ["buyer"];
  const sections = [
    {
      title: "Buying",
      items: [
        { to: "/buyer/dashboard", label: "Overview", icon: LayoutDashboard },
        { to: "/buyer/wishlist", label: "Wishlist", icon: Heart },
        { to: "/buyer/cart", label: "Cart", icon: ShoppingCart },
        { to: "/buyer/orders", label: "Orders", icon: Package },
        { to: "/buyer/notifications", label: "Notifications", icon: Bell },
        { to: "/buyer/settings", label: "Settings", icon: Settings },
      ],
    },
    {
      title: "Ownership",
      items: [
        { to: "/buyer/registry", label: "My records", icon: ShieldCheck },
        { to: "/registry/register-property", label: "Register property", icon: ListPlus },
        { to: "/protection/reports", label: "Protection reports", icon: Flag },
        { to: "/ownership-check", label: "Public check", icon: Search },
      ],
    },
  ];

  if (types.includes("seller") || ["reviewer", "admin"].includes(role)) {
    sections.push({
      title: "Selling",
      items: [
        { to: "/seller/dashboard", label: "Seller overview", icon: Store },
        { to: "/seller/listings", label: "Listings", icon: ClipboardList },
        { to: "/seller/orders", label: "Seller orders", icon: Package },
        { to: "/seller/verification", label: "Verification", icon: BadgeCheck },
        { to: "/seller/analytics", label: "Analytics", icon: BarChart3 },
        { to: "/seller/payouts", label: "Payouts", icon: Wallet },
      ],
    });
  }

  if (["reviewer", "admin"].includes(role)) {
    sections.push({
      title: "Review desk",
      items: [
        { to: "/admin/verification", label: "Seller verification", icon: BadgeCheck },
        { to: "/admin/listings", label: "Listing moderation", icon: Layers },
      ],
    });
  }

  if (["investigator", "admin"].includes(role)) {
    sections.push({
      title: "Investigation",
      items: [
        { to: "/investigator/dashboard", label: "Case overview", icon: FileSearch },
        { to: "/investigator/cases", label: "Cases", icon: FolderLock },
        { to: "/investigator/reports", label: "Protection reports", icon: Flag },
      ],
    });
  }

  if (["auditor", "admin"].includes(role)) {
    sections.push({
      title: "Audit",
      items: [
        { to: "/auditor/dashboard", label: "Audit overview", icon: ScrollText },
        { to: "/auditor/logs", label: "Audit trail", icon: FolderOpen },
      ],
    });
  }

  if (role === "admin") {
    sections.push({
      title: "Administration",
      items: [
        { to: "/admin/dashboard", label: "Command centre", icon: LayoutDashboard },
        { to: "/admin/users", label: "Users & roles", icon: Users },
        { to: "/admin/orders", label: "Orders", icon: Package },
        { to: "/admin/registry", label: "Registry", icon: ShieldCheck },
        { to: "/admin/reports", label: "Reports", icon: Flag },
        { to: "/admin/disputes", label: "Disputes", icon: Gavel },
        { to: "/admin/audit-logs", label: "Audit logs", icon: ScrollText },
        { to: "/admin/integrations", label: "Integrations", icon: Plug },
        { to: "/admin/settings", label: "Settings", icon: Settings },
      ],
    });
  }

  return sections;
}