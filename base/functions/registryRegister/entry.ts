import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, refCode, hashIdentifier, maskIdentifier, riskFrom, audit, notify, requireUser } from '../../shared/security.ts';

const CATEGORIES = ["smartphones", "laptops", "tablets", "desktops", "accessories", "other"];
const ID_TYPES = ["imei", "serial", "mac"];
const OPEN_STATES = ["pending_review", "registered", "transfer_pending", "restricted", "reported_lost", "reported_stolen", "disputed"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to register a property." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const category = clean(body.category, 40);
    const brand = clean(body.brand, 60);
    const model = clean(body.model, 80);
    const identifierType = clean(body.identifier_type, 20);
    const rawIdentifier = String(body.identifier || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const purchaseDate = clean(body.purchase_date, 20);
    const evidence = Array.isArray(body.evidence_uris)
      ? body.evidence_uris.filter((uri) => typeof uri === "string" && uri.startsWith("private/")).slice(0, 5)
      : [];

    if (!CATEGORIES.includes(category)) return Response.json({ error: "Choose a supported property category." }, { status: 400 });
    if (brand.length < 2 || model.length < 2) return Response.json({ error: "Brand and model are required." }, { status: 400 });
    if (!ID_TYPES.includes(identifierType)) return Response.json({ error: "Choose a supported identifier type." }, { status: 400 });
    if (rawIdentifier.length < 6 || rawIdentifier.length > 24) {
      return Response.json({ error: "Enter a valid device identifier (6 to 24 characters)." }, { status: 400 });
    }
    if (!evidence.length) {
      return Response.json({ error: "Attach at least one proof-of-purchase document (stored privately)." }, { status: 400 });
    }

    const hash = await hashIdentifier(identifierType + ":" + rawIdentifier);
    const { items: duplicates } = await base44.asServiceRole.entities.OwnershipRecord.filter(
      { identifier_hash: hash, status: { $in: OPEN_STATES } },
      { limit: 1 }
    );
    if (duplicates.length) {
      await audit(base44, {
        actor_id: user.id,
        actor_name: user.full_name,
        action: "registry.register.duplicate",
        resource_type: "OwnershipRecord",
        resource_id: hash.slice(0, 10),
        outcome: "denied",
        reason: "Identifier already has an active record",
      });
      return Response.json(
        { error: "This device identifier already has an active AMANA record. If you believe this is an error, open a support request with your proof of purchase." },
        { status: 409 }
      );
    }

    const signals = [];
    if (evidence.length < 2) signals.push({ id: "R-EVIDENCE-THIN", level: "low", note: "Only one evidence document supplied" });
    if (!purchaseDate) signals.push({ id: "R-PURCHASE-DATE-MISSING", level: "low", note: "No purchase date provided" });
    const risk = riskFrom(signals);
    const ownerName = clean(user.full_name || user.email, 100);
    const now = new Date().toISOString();

    const record = await base44.asServiceRole.entities.OwnershipRecord.create({
      owner_id: user.id,
      owner_name: ownerName,
      public_ref: refCode("AMN"),
      category,
      brand,
      model,
      identifier_type: identifierType,
      identifier_masked: maskIdentifier(rawIdentifier),
      identifier_hash: hash,
      purchase_date: purchaseDate,
      evidence_uris: evidence,
      status: "pending_review",
      verification_state: "unverified",
      risk_level: risk.level,
      risk_rules: risk.rules,
      history: [{ event: "registered", at: now, actor_name: ownerName, note: "Ownership record submitted for review." }],
    });

    await base44.asServiceRole.entities.RiskAssessment.create({
      subject_type: "record",
      subject_id: record.id,
      subject_label: brand + " " + model,
      level: risk.level,
      score: risk.score,
      rules: risk.rules,
      explanation: risk.explanation,
      review_state: "auto",
    });

    await audit(base44, {
      actor_id: user.id,
      actor_name: ownerName,
      actor_role: "user",
      action: "registry.register",
      resource_type: "OwnershipRecord",
      resource_id: record.id,
      metadata: { public_ref: record.public_ref, category, identifier_type: identifierType },
    });

    await notify(base44, {
      user_id: user.id,
      category: "registry",
      title: "Ownership record submitted",
      body: "Record " + record.public_ref + " is pending review. We will notify you when a reviewer completes the check.",
      link: "/buyer/registry/" + record.id,
    });

    return Response.json({
      record: { id: record.id, public_ref: record.public_ref, status: record.status, risk_level: record.risk_level },
    });
  } catch (error) {
    return Response.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}