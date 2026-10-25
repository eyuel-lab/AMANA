import { Link } from "react-router-dom";
import { Smartphone, Laptop, Tablet, Monitor, Headphones, Cpu, ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const ICONS = { Smartphone, Laptop, Tablet, Monitor, Headphones, Cpu };

export default function CategoryStrip() {
  return (
    <section className="container-page py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Browse by category</p>
          <h2 className="mt-2 font-display text-[28px] text-forest sm:text-[32px]">Devices people actually trade</h2>
        </div>
        <Link to="/marketplace" className="hidden text-[13px] font-medium text-forest underline-offset-4 hover:underline sm:inline-flex sm:items-center sm:gap-1">
          All listings <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((category) => {
          const Icon = ICONS[category.icon] || Cpu;
          return (
            <Link
              key={category.slug}
              to={"/marketplace/category/" + category.slug}
              className="group flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-forest/6 text-forest transition-colors group-hover:bg-forest group-hover:text-ivory">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[13px] font-semibold leading-tight text-forest">{category.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}