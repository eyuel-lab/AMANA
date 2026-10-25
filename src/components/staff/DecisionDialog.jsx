import { useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const STYLES = {
  approve: "bg-forest text-ivory hover:bg-forest-deep",
  confirm: "bg-forest text-ivory hover:bg-forest-deep",
  resolve: "bg-forest text-ivory hover:bg-forest-deep",
  reject: "border border-danger/30 text-danger hover:bg-danger-soft",
  more_info: "border border-warning/30 text-warning hover:bg-warning-soft",
};

export default function DecisionDialog({ open, onOpenChange, subject, id, title, description, actions, onDone }) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const submit = async (action) => {
    setBusy(action);
    setError("");
    try {
      await base44.functions.invoke("staffDecision", { subject, id, action, notes });
      setNotes("");
      onOpenChange(false);
      onDone?.();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Decision failed.");
    } finally {
      setBusy("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description || "The decision is recorded in the audit trail with your account and a reason."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Reason or note (required for rejections and information requests)" />
          {error && <p className="rounded-lg border border-danger/20 bg-danger-soft p-2.5 text-[12px] text-danger">{error}</p>}
        </div>
        <DialogFooter className="flex-wrap gap-2">
          {actions.map((action) => (
            <Button key={action.value} onClick={() => submit(action.value)} disabled={Boolean(busy)} className={STYLES[action.value] || ""}>
              {busy === action.value ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              {action.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}