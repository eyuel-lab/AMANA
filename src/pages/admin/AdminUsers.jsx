import { useEffect, useState } from "react";
import { Loader2, UserPlus, ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_LABEL } from "@/lib/roles";
import { formatDate } from "@/lib/format";

const ROLES = ["user", "reviewer", "investigator", "auditor", "admin"];

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState(null);
  const [draftRoles, setDraftRoles] = useState({});
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [invite, setInvite] = useState({ email: "", role: "user" });
  const [inviting, setInviting] = useState(false);

  const load = () => base44.entities.User.list().then((rows) => setUsers(rows));
  useEffect(() => { load(); }, []);

  const saveRole = async (target) => {
    const role = draftRoles[target.id] || target.role || "user";
    setBusy(target.id);
    setNotice("");
    try {
      await base44.functions.invoke("adminSetRole", { user_id: target.id, role, reason: "Role updated from the admin console." });
      setNotice(`Role for ${target.email} set to ${ROLE_LABEL[role] || role}.`);
      await load();
    } catch (err) {
      setNotice(err.response?.data?.error || err.message);
    } finally {
      setBusy("");
    }
  };

  const sendInvite = async (event) => {
    event.preventDefault();
    setInviting(true);
    setNotice("");
    try {
      await base44.users.inviteUser(invite.email, invite.role);
      setNotice(`Invitation sent to ${invite.email} as ${ROLE_LABEL[invite.role] || invite.role}.`);
      setInvite({ email: "", role: "user" });
    } catch (err) {
      setNotice(err.message || "Invitation failed.");
    } finally {
      setInviting(false);
    }
  };

  if (!users) return <LoadingBlock rows={5} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Users and roles" description="Privileged staff roles are granted here only. A user can never grant themselves a role from the app." />

      {notice && <p className="rounded-lg border border-success/20 bg-success-soft p-3 text-[12.5px] text-success">{notice}</p>}

      <form onSubmit={sendInvite} className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1"><Label htmlFor="invite-email">Invite a user</Label><Input id="invite-email" type="email" value={invite.email} onChange={(event) => setInvite((current) => ({ ...current, email: event.target.value }))} placeholder="person@example.com" className="mt-1.5" required /></div>
        <div>
          <Label>Role</Label>
          <Select value={invite.role} onValueChange={(value) => setInvite((current) => ({ ...current, role: value }))}>
            <SelectTrigger className="mt-1.5 w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>{ROLES.map((role) => <SelectItem key={role} value={role}>{ROLE_LABEL[role]}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={inviting} className="bg-forest text-ivory hover:bg-forest-deep">
          {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="mr-1.5 h-4 w-4" />} Invite
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-[12.5px]">
          <thead className="bg-secondary/60 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 font-medium">Member</th>
              <th className="px-3 py-2.5 font-medium">Joined</th>
              <th className="px-3 py-2.5 font-medium">Role</th>
              <th className="px-3 py-2.5 font-medium">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {users.map((member) => (
              <tr key={member.id}>
                <td className="px-3 py-3">
                  <p className="font-medium text-forest">{member.full_name || "—"}</p>
                  <p className="text-[11px] text-muted-foreground">{member.email}</p>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{formatDate(member.created_date)}</td>
                <td className="px-3 py-3 capitalize text-forest">{ROLE_LABEL[member.role || "user"]}</td>
                <td className="px-3 py-3">
                  {member.id === user.id ? (
                    <span className="text-[11px] text-muted-foreground">Your account</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select value={draftRoles[member.id] || member.role || "user"} onValueChange={(value) => setDraftRoles((current) => ({ ...current, [member.id]: value }))}>
                        <SelectTrigger className="h-8 w-[150px] text-[12px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{ROLES.map((role) => <SelectItem key={role} value={role}>{ROLE_LABEL[role]}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" className="h-8 border-forest/25 text-forest" onClick={() => saveRole(member)} disabled={busy === member.id}>
                        {busy === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-[11.5px] leading-5 text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        Every role change is written to the audit log with the administrator, target account and previous role. You cannot change your own role.
      </div>
    </div>
  );
}