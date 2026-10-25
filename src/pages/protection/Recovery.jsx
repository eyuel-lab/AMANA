import { Link } from "react-router-dom";
import { Radar, MapPinOff, FileSearch, BellRing, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Recovery() {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow">AMANA Recovery</p>
        <h1 className="mt-2 font-display text-[38px] leading-tight text-forest sm:text-[46px]">Case management, not covert tracking</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
          Recovery is an early-stage module for reports, evidence and case coordination. A website cannot locate an arbitrary stolen phone, and AMANA will never pretend it can.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: MapPinOff, title: "No hidden tracking", body: "AMANA does not access device location. Location-based recovery would require explicit enrolment, operating-system permission and a lawful integration." },
          { icon: FileSearch, title: "Case workflow", body: "Confirmed reports can open a case, with assigned investigators, findings and a structured evidence trail." },
          { icon: BellRing, title: "Status updates", body: "Reporters are notified when a reviewer requests information, confirms or rejects a report." },
          { icon: Lock, title: "Restricted access", body: "Case material is limited to assigned investigators and administrators. Every decision is logged." },
          { icon: Radar, title: "Not connected", body: "Location integration is not configured in this environment. Case management works without fabricated location data." },
        ].map((item) => (
          <div key={item.title} className="surface-card p-5">
            <item.icon className="h-5 w-5 text-forest" />
            <h2 className="mt-3 text-[14px] font-semibold text-forest">{item.title}</h2>
            <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild className="rounded-full bg-forest text-ivory hover:bg-forest-deep"><Link to="/protection/report">File a report</Link></Button>
        <Button asChild variant="outline" className="rounded-full border-forest/25 text-forest"><Link to="/protection/reports">My reports</Link></Button>
      </div>
    </div>
  );
}