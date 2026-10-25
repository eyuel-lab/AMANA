export default function StatCard({ label, value, hint, icon: Icon, tone = "default" }) {
  const accent = tone === "warn" ? "text-warning" : tone === "danger" ? "text-danger" : "text-forest";
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        {Icon && <Icon className={`h-4 w-4 ${accent}`} aria-hidden="true" />}
      </div>
      <p className="mt-3 font-display text-[30px] leading-none text-forest">{value ?? "—"}</p>
      {hint && <p className="mt-2 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}