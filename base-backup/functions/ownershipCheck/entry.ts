import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const REF_PATTERN = /^AMN-[A-Z2-9]{6,12}$/;

export default async function (req) {
  try {
    if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
    const body = await req.json().catch(() => ({}));
    const ref = String(body.ref || "").trim().toUpperCase();
    if (!REF_PATTERN.test(ref)) {
      return Response.json({ error: "Enter a valid AMANA reference, for example AMN-7K2Q4M8X." }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const { items } = await base44.asServiceRole.entities.OwnershipRecord.filter(
      { public_ref: ref },
      { limit: 1 }
    );
    if (!items.length) return Response.json({ found: false });

    const record = items[0];
    const status = record.status;
    const restricted = ["restricted", "reported_stolen", "reported_lost", "disputed"].includes(status);
    const warnings = {
      reported_stolen: "This device was reported stolen. Ownership transfers are blocked while the report is reviewed.",
      reported_lost: "This device was reported lost. Ownership transfers are blocked while the report is reviewed.",
      restricted: "This record is restricted while an open report is reviewed.",
      disputed: "Ownership of this record is under dispute.",
    };

    return Response.json({
      found: true,
      checked_at: new Date().toISOString(),
      record: {
        public_ref: record.public_ref,
        category: record.category,
        brand: record.brand,
        model: record.model,
        masked_identifier: record.identifier_masked,
        status,
        verification_state: record.verification_state,
        certificate_serial: record.certificate_serial || null,
        certificate_issued_at: record.certificate_issued_at || null,
        registered_on: record.created_date,
        warning: restricted ? warnings[status] || "Record restricted." : null,
        report_is_allegation: restricted ? true : false,
        can_transfer: status === "registered" && record.verification_state === "verified",
      },
    });
  } catch (error) {
    return Response.json({ error: "Ownership check is temporarily unavailable." }, { status: 500 });
  }
}