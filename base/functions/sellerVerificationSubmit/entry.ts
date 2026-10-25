import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, audit, notify, requireUser } from '../../shared/security.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to apply for verification." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const legalName = clean(body.legal_name, 100);
    const businessName = clean(body.business_name, 100);
    const phone = clean(body.phone, 30);
    const city = clean(body.city, 60);
    const region = clean(body.region, 60);
    const idDocumentUri = clean(body.id_document_uri, 400);
    const businessDocumentUri = clean(body.business_document_uri, 400);

    if (legalName.length < 3) return Response.json({ error: "Enter your full legal name." }, { status: 400 });
    if (!/^[0-9+\s()-]{7,20}$/.test(phone)) return Response.json({ error: "Enter a valid phone number." }, { status: 400 });
    if (!city || !region) return Response.json({ error: "City and region are required." }, { status: 400 });
    if (!idDocumentUri.startsWith("private/")) {
      return Response.json({ error: "Upload an identity document (stored privately)." }, { status: 400 });
    }

    const { items: existing } = await base44.asServiceRole.entities.SellerVerification.filter(
      { user_id: user.id },
      { sort: "-created_date", limit: 5 }
    );
    if (existing.some((item) => item.status === "verified")) {
      return Response.json({ error: "Your seller account is already verified." }, { status: 409 });
    }
    if (existing.some((item) => item.status === "pending")) {
      return Response.json({ error: "You already have a verification request under review." }, { status: 409 });
    }

    const verification = await base44.asServiceRole.entities.SellerVerification.create({
      user_id: user.id,
      user_email: user.email,
      legal_name: legalName,
      business_name: businessName,
      phone,
      city,
      region,
      id_document_uri: idDocumentUri,
      business_document_uri: businessDocumentUri.startsWith("private/") ? businessDocumentUri : "",
      status: "pending",
      submitted_at: new Date().toISOString(),
    });

    await audit(base44, {
      actor_id: user.id, actor_name: user.full_name, actor_role: "user",
      action: "verification.submit", resource_type: "SellerVerification", resource_id: verification.id,
    });

    await notify(base44, {
      user_id: user.id, category: "verification", title: "Verification request received",
      body: "A reviewer will examine your documents. You will be notified when a decision is recorded.",
      link: "/seller/verification",
    });

    return Response.json({ verification: { id: verification.id, status: verification.status } });
  } catch (error) {
    return Response.json({ error: "Could not submit verification." }, { status: 500 });
  }
}