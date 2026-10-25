export const STAFF_ROLES = ["reviewer", "investigator", "auditor", "admin"];

export const ROLE_LABEL = {
  user: "Member",
  reviewer: "Verification reviewer",
  investigator: "Investigator",
  auditor: "Auditor",
  admin: "Administrator",
};

export const roleOf = (user) => user?.role || "user";

export const isAdmin = (user) => roleOf(user) === "admin";
export const canReview = (user) => ["reviewer", "admin"].includes(roleOf(user));
export const canInvestigate = (user) => ["investigator", "admin"].includes(roleOf(user));
export const canAudit = (user) => ["auditor", "admin"].includes(roleOf(user));
export const isStaff = (user) => STAFF_ROLES.includes(roleOf(user));

export function homeForRole(user) {
  const role = roleOf(user);
  if (role === "admin") return "/admin/dashboard";
  if (role === "reviewer") return "/admin/verification";
  if (role === "investigator") return "/investigator/dashboard";
  if (role === "auditor") return "/auditor/dashboard";
  return "/buyer/dashboard";
}

export function accountTypes(profile) {
  const types = profile?.account_types;
  return Array.isArray(types) && types.length ? types : ["buyer"];
}

export const isSeller = (profile) => accountTypes(profile).includes("seller");