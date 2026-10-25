export const CATEGORIES = [
  { slug: "smartphones", name: "Smartphones", icon: "Smartphone", blurb: "Phones, phablets and everyday mobile devices" },
  { slug: "laptops", name: "Laptops", icon: "Laptop", blurb: "Notebooks for work, study and creative work" },
  { slug: "tablets", name: "Tablets", icon: "Tablet", blurb: "Tablets and detachable devices" },
  { slug: "desktops", name: "Desktop computers", icon: "Monitor", blurb: "Desktop towers, all-in-ones and workstations" },
  { slug: "accessories", name: "Accessories", icon: "Headphones", blurb: "Audio, wearables, chargers and peripherals" },
  { slug: "other", name: "Other electronics", icon: "Cpu", blurb: "Cameras, consoles and other approved devices" },
];

export const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

export const REGIONS = [
  "Addis Ababa", "Oromia", "Amhara", "Tigray", "Sidama", "Somali", "Afar",
  "Benishangul-Gumuz", "Gambella", "Harari", "Dire Dawa", "Central Ethiopia",
  "South Ethiopia", "South West Ethiopia",
];

export const REPORT_TYPES = [
  { value: "stolen", label: "Stolen" },
  { value: "lost", label: "Lost" },
];

export const IDENTIFIER_TYPES = [
  { value: "imei", label: "IMEI" },
  { value: "serial", label: "Serial number" },
  { value: "mac", label: "Device identifier" },
];

export const DELIVERY_FEE = 250;

export const LISTING_STATUS_LABEL = {
  draft: "Draft", pending: "Pending review", active: "Live", paused: "Paused",
  rejected: "Rejected", sold: "Sold", reserved: "Reserved",
};

export const RECORD_STATUS_LABEL = {
  pending_review: "Pending review", registered: "Registered", transfer_pending: "Transfer pending",
  restricted: "Restricted", reported_lost: "Reported lost", reported_stolen: "Reported stolen",
  disputed: "Disputed", archived: "Archived",
};

export const REPORT_STATUS_LABEL = {
  submitted: "Submitted", under_review: "Under review", more_info: "More information required",
  confirmed: "Confirmed", rejected: "Rejected", resolved: "Resolved", closed: "Closed",
};

export const ORDER_STATUS_LABEL = {
  pending_payment: "Pending payment", paid: "Paid", confirmed: "Confirmed", processing: "Processing",
  ready: "Ready for collection", completed: "Completed", cancelled: "Cancelled",
  refund_pending: "Refund pending", refunded: "Refunded", disputed: "Disputed",
};

export const label = (map, value) => map[value] || (value ? String(value).replace(/_/g, " ") : "—");