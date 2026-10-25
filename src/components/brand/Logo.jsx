import { Link } from "react-router-dom";

export default function Logo({ tone = "dark", compact = false, to = "/" }) {
  const ink = tone === "light" ? "text-ivory" : "text-forest";
  const sub = tone === "light" ? "text-ivory/55" : "text-muted-foreground";
  return (
    <Link to={to} className={`group flex items-center gap-2.5 ${ink}`} aria-label="AMANA — home">
      <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true">
        <path d="M18 2.5 31.5 8v10.2c0 7.4-5.6 12.9-13.5 15.3C10.1 31.1 4.5 25.6 4.5 18.2V8L18 2.5Z" fill="currentColor" />
        <path d="M18 7.4 26.6 11v7.2c0 5-3.6 8.9-8.6 10.6-5-1.7-8.6-5.6-8.6-10.6V11L18 7.4Z" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.1" opacity="0.9" />
        <path d="M18 12.4 22.9 22h-2.8l-.9-1.9h-2.4l-.9 1.9h-2.8L18 12.4Zm0 4.6-1 2.1h2l-1-2.1Z" fill="hsl(var(--accent))" />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[21px] font-medium tracking-[0.18em]">AMANA</span>
          <span className={`mt-1 text-[8.5px] uppercase tracking-[0.3em] ${sub}`}>Ownership, protected</span>
        </span>
      )}
    </Link>
  );
}