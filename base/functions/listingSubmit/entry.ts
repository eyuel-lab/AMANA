import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, riskFrom, audit, notify, requireUser } from '../../shared/security.ts';

const CATEGORIES = ["smartphones", "laptops", "tablets", "desktops", "accessories", "other"];
const CONDITIONS = ["new", "like_new", "good", "fair"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to publish a listing." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const listingId = clean(body.listing_id, 60);
    if (!listingId) return Response.json({ error: "Missing listing." }, { status: 400 });

    let listing;
    try {
      listing = await base44.asServiceRole.entities.ProductListing.get(listingId);
    } catch (_error) {
      return Response.json({ error: "Listing not found." }, { status: 404 });
    }
    if (listing.seller_id !== user.id) {
      await audit(base44, {
        actor_id: user.id, actor_name: user.full_name, action: "listing.submit.denied",
        resource_type: "ProductListing", resource_id: listingId, outcome: "denied", reason: "Not the listing owner",
      });
      return Response.json({ error: "You can only submit your own listings." }, { status: 403 });
    }
    if (!["draft", "rejected", "paused"].includes(listing.status)) {
      return Response.json({ error: "This listing is already in review or live." }, { status: 409 });
    }

    const { items: verifications } = await base44.asServiceRole.entities.SellerVerification.filter(
      { user_id: user.id, status: "verified" },
      { limit: 1 }
    );
    if (!verifications.length) {
      return Response.json({ error: "Complete seller verification before submitting listings." }, { status: 403 });
    }

    const title = clean(listing.title, 120);
    const description = clean(listing.description, 4000);
    const price = Number(listing.price);
    const images = Array.isArray(listing.images) ? listing.images.filter((url) => typeof url === "string" && url.startsWith("https://")).slice(0, 6) : [];

    if (title.length < 8) return Response.json({ error: "Add a descriptive title (at least 8 characters)." }, { status: 400 });
    if (description.length < 30) return Response.json({ error: "Add a description of at least 30 characters." }, { status: 400 });
    if (!CATEGORIES.includes(listing.category)) return Response.json({ error: "Choose a valid category." }, { status: 400 });
    if (!CONDITIONS.includes(listing.condition)) return Response.json({ error: "Choose a valid condition." }, { status: 400 });
    if (!Number.isFinite(price) || price <= 0 || price > 5000000) return Response.json({ error: "Enter a valid price in ETB." }, { status: 400 });
    if (!images.length) return Response.json({ error: "Upload at least one product photo." }, { status: 400 });
    if (!clean(listing.location, 60)) return Response.json({ error: "Add the collection location." }, { status: 400 });

    const signals = [];
    let registryStatus = "none";
    if (listing.registry_record_id) {
      try {
        const record = await base44.asServiceRole.entities.OwnershipRecord.get(listing.registry_record_id);
        registryStatus = record.status;
        if (record.owner_id !== user.id) {
          return Response.json({ error: "You can only link an ownership record you own." }, { status: 403 });
        }
        if (["restricted", "reported_lost", "reported_stolen", "disputed"].includes(record.status)) {
          signals.push({ id: "R-REGISTRY-RESTRICTED", level: "high", note: "Linked record has an active restriction" });
        }
      } catch (_error) {
        return Response.json({ error: "The linked ownership record could not be found." }, { status: 400 });
      }
    } else if (listing.condition !== "new") {
      signals.push({ id: "R-NO-REGISTRY-LINK", level: "low", note: "Used device is not linked to an ownership record" });
    }
    if (["smartphones", "laptops", "tablets"].includes(listing.category) && price < 800) {
      signals.push({ id: "R-IMPLAUSIBLE-PRICE", level: "medium", note: "Price far below market range for this category" });
    }
    const { items: recent } = await base44.asServiceRole.entities.ProductListing.filter(
      { seller_id: user.id, title, status: { $in: ["pending", "active"] } },
      { limit: 1 }
    );
    if (recent.length) signals.push({ id: "R-DUPLICATE-LISTING", level: "medium", note: "An identical listing is already pending or live" });

    const risk = riskFrom(signals);
    const now = new Date().toISOString();

    const updated = await base44.asServiceRole.entities.ProductListing.update(listingId, {
      title,
      description,
      images,
      status: "pending",
      submitted_at: now,
      seller_name: clean(user.full_name || user.email, 100),
      seller_verified: true,
      risk_level: risk.level,
      registry_status: registryStatus,
      moderation_notes: "",
    });

    await base44.asServiceRole.entities.RiskAssessment.create({
      subject_type: "listing",
      subject_id: listingId,
      subject_label: title,
      level: risk.level,
      score: risk.score,
      rules: risk.rules,
      explanation: risk.explanation,
      review_state: risk.level === "low" ? "auto" : "pending_review",
    });

    await audit(base44, {
      actor_id: user.id, actor_name: user.full_name, actor_role: "user",
      action: "listing.submit", resource_type: "ProductListing", resource_id: listingId,
      metadata: { risk: risk.level, rules: risk.rules },
    });

    await notify(base44, {
      user_id: user.id, category: "listing", title: "Listing submitted for review",
      body: title + " is now queued for moderation.", link: "/seller/listings",
    });

    return Response.json({ listing: { id: updated.id, status: updated.status, risk_level: updated.risk_level } });
  } catch (error) {
    return Response.json({ error: "Submission failed. Please try again." }, { status: 500 });
  }
}