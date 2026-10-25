import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, audit, notify, requireUser, roleOf } from '../../shared/security.ts';

const ROLES = ["user", "reviewer", "investigator", "auditor", "admin"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });

    if (roleOf(user) !== "admin") {
      await audit(base44, {
        actor_id: user.id, actor_name: user.full_name, actor_role: roleOf(user),
        action: "admin.set_role.denied", resource_type: "User", outcome: "denied", reason: "Admin role required",
      });
      return Response.json({ error: "Only administrators can change roles." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const userId = clean(body.user_id, 60);
    const role = clean(body.role, 20);
    const reason = clean(body.reason, 200);

    if (!ROLES.includes(role)) return Response.json({ error: "Unknown role." }, { status: 400 });
    if (userId === user.id) return Response.json({ error: "You cannot change your own role." }, { status: 400 });

    let target;
    try {
      target = await base44.asServiceRole.entities.User.get(userId);
    } catch (_error) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    await base44.asServiceRole.entities.User.update(userId, { role });

    await audit(base44, {
      actor_id: user.id, actor_name: user.full_name, actor_role: "admin",
      action: "admin.set_role", resource_type: "User", resource_id: userId,
      reason, metadata: { from: target.role || "user", to: role, target_email: target.email },
    });

    await notify(base44, {
      user_id: userId, category: "security", title: "Your AMANA access level changed",
      body: "An administrator set your role to " + role + ".", link: "/buyer/notifications", is_security: true,
    });

    return Response.json({ ok: true, role });
  } catch (error) {
    return Response.json({ error: "Could not change the role." }, { status: 500 });
  }
}