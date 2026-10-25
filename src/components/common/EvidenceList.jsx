import { useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function EvidenceList({ uris = [], emptyLabel = "No documents attached." }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const open = async (uri) => {
    setBusy(true);
    setError("");
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
      window.open(signed_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message || "Could not open this document.");
    } finally {
      setBusy(false);
    }
  };

  if (!uris.length) return <p className="text-[12.5px] text-muted-foreground">{emptyLabel}</p>;

  return (
    <div className="space-y-2">
      {uris.map((uri, index) => (
        <button
          key={uri + index}
          type="button"
          onClick={() => open(uri)}
          disabled={busy}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-[12.5px] text-forest hover:border-forest/30"
        >
          <span className="inline-flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Evidence document {index + 1}</span>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      ))}
      <p className="text-[11px] text-muted-foreground">Private documents open through a link that expires after five minutes.</p>
      {error && <p className="text-[11.5px] text-danger">{error}</p>}
    </div>
  );
}