import { base44 } from "@/api/base44Client";

export async function getMyProfile(user) {
  if (!user) return null;
  const { items } = await base44.entities.UserProfile.filter({}, { sort: "-created_date", limit: 1 });
  if (items.length) return items[0];
  return null;
}

export async function ensureProfile(user) {
  if (!user) return null;
  const existing = await getMyProfile(user);
  if (existing) return existing;
  try {
    return await base44.entities.UserProfile.create({
      full_name: user.full_name || "",
      email: user.email || "",
      account_types: ["buyer"],
      city: "",
      region: "Addis Ababa",
      notification_prefs: { in_app: true, email: false },
      terms_accepted_at: new Date().toISOString(),
    });
  } catch {
    return getMyProfile(user);
  }
}

export async function myVerification() {
  const { items } = await base44.entities.SellerVerification.filter({}, { sort: "-created_date", limit: 1 });
  return items[0] || null;
}

export const sellerVerified = (verification) => verification?.status === "verified";