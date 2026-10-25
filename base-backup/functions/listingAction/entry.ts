import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, audit, requireUser } from '../../shared/security.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to manage listings." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const listingId = clean(body.listing_id, 60);
    const action = clean(body.action, 20);

    let listing;
    try {
      listing = await base44.asServiceRole.entities.ProductListing.get(listingId);
    } catch (_error) {
      return Response.json({ error: "Listing not found." }, { status: 404 });
    }
    if (listing.seller_id !== user.id) {
      await audit(base44, {
        actor_id: user.id, actor_name: user.full_name, action: "listing." + action + ".denied",
        resource_type: "ProductListing", resource_id: listingId, outcome: "denied", reason: "Not the listing owner",
      });
      return Response.json({ error: "You can only manage your own listings." }, { status: 403 });
    }

    if (action === "pause") {
      if (listing.status !== "active") return Response.json({ error: "Only live listings can be paused." }, { status: 409 });
      await base44.asServiceRole.entities.ProductListing.update(listingId, { status: "paused" });
    } else if (action === "reactivate") {
      if (listing.status !== "paused") return Response.json({ error: "Only paused listings can be reactivated." }, { status: 409 });
      await base44.asServiceRole.entities.ProductListing.update(listingId, { status: "pending", submitted_at: new Date().toISOString() });
    } else if (action === "delete") {
      if (!["draft", "rejected"].includes(listing.status)) {
        return Response.json({ error: "Only drafts or rejected listings can be removed." }, { status: 409 });
      }
      await base44.asServiceRole.entities.ProductListing.delete(listingId);
    } else {
      return Response.json({ error: "Unsupported action." }, { status: 400 });
    }

    await audit(base44, {
      actor_id: user.id, actor_name: user.full_name, actor_role: "user",
      action: "listing." + action, resource_type: "ProductListing", resource_id: listingId,
    });

    return Response.json({ ok: true, action });
  } catch (error) {
    return Response.json({ error: "Could not update the listing." }, { status: 500 });
  }
}