const encoder = new TextEncoder();
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function clean(value, max = 600) {
    return String(value ?? "")
        .replace(/[\u0000-\u001F\u007F<>]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max);
}

export function refCode(prefix, length = 8) {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    let code = "";
    for (let i = 0; i < length; i += 1) code += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
    return prefix + "-" + code;
}

export async function hashIdentifier(value) {
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(value)));
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function maskIdentifier(value) {
    const raw = String(value || "").replace(/\s+/g, "");
    if (raw.length <= 4) return "••••";
    return "•".repeat(Math.min(12, Math.max(0, raw.length - 4))) + raw.slice(-4);
}

export function roleOf(user) {
    return (user && user.role) || "user";
}

export function hasRole(user, roles) {
    return roles.includes(roleOf(user));
}

export function riskFrom(signals) {
    const weight = { low: 1, medium: 2, high: 3 };
    let level = "low";
    let score = 0;
    const rules = [];
    (signals || []).forEach((signal) => {
        if (!signal || !signal.level) return;
        rules.push(signal.id + ": " + signal.note);
        score += weight[signal.level] || 1;
        if ((weight[signal.level] || 1) > weight[level]) level = signal.level;
    });
    return {
        level,
        score,
        rules,
        explanation: rules.length ? rules.join(" · ") : "No risk rules triggered.",
    };
}

export async function audit(base44, entry) {
    try {
        await base44.asServiceRole.entities.AuditLog.create({
            actor_id: entry.actor_id || "",
            actor_name: entry.actor_name || "",
            actor_role: entry.actor_role || "user",
            action: entry.action,
            resource_type: entry.resource_type || "",
            resource_id: entry.resource_id || "",
            outcome: entry.outcome || "success",
            reason: entry.reason || "",
            metadata: entry.metadata ? JSON.stringify(entry.metadata).slice(0, 2000) : "",
        });
    } catch (_error) {
        // Audit failures must never break the business operation.
    }
}

export async function notify(base44, entry) {
    if (!entry || !entry.user_id) return;
    try {
        await base44.asServiceRole.entities.Notification.create({
            user_id: entry.user_id,
            category: entry.category || "general",
            title: entry.title || "AMANA update",
            body: entry.body || "",
            link: entry.link || "",
            read: false,
            is_security: Boolean(entry.is_security),
        });
    } catch (_error) {
        // Notifications are best effort.
    }
}

export function json(data, status = 200) {
    return Response.json(data, { status });
}

export async function requireUser(base44) {
    try {
        const user = await base44.auth.me();
        if (user && user.id) return user;
        return null;
    } catch (_error) {
        return null;
    }
}