import { Link } from "react-router-dom";
import Logo from "@/components/brand/Logo";

const COLUMNS = [
  {
    title: "Marketplace",
    links: [
      { to: "/marketplace", label: "All listings" },
      { to: "/marketplace/category/smartphones", label: "Smartphones" },
      { to: "/marketplace/category/laptops", label: "Laptops" },
      { to: "/marketplace/category/accessories", label: "Accessories" },
    ],
  },
  {
    title: "Ownership",
    links: [
      { to: "/ownership-check", label: "Check a record" },
      { to: "/registry/register-property", label: "Register property" },
      { to: "/buyer/registry", label: "My records" },
      { to: "/buyer/registry", label: "Transfer ownership" },
    ],
  },
  {
    title: "Protection",
    links: [
      { to: "/protection/report", label: "Report lost or stolen" },
      { to: "/protection/reports", label: "My reports" },
      { to: "/recovery", label: "AMANA Recovery" },
      { to: "/safety", label: "Buyer & seller safety" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About AMANA" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/help", label: "Help centre" },
      { to: "/contact", label: "Contact support" },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="mt-24 border-t border-forest/10 bg-forest-deep text-ivory">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-ivory/70">
              AMANA is a private ownership registry and electronics marketplace built for Ethiopia. It is not a government registry.
            </p>
            <p className="mt-4 text-[13px] text-ivory/50">Addis Ababa, Ethiopia · ETB pricing</p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-ivory/70 transition-colors hover:text-ivory">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-ivory/15 pt-6 text-[12.5px] text-ivory/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AMANA. Demonstration environment unless stated otherwise.</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/terms" className="hover:text-ivory">Terms of service</Link>
            <Link to="/privacy" className="hover:text-ivory">Privacy policy</Link>
            <Link to="/help" className="hover:text-ivory">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}