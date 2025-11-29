import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Loader2, Shield, Trash2 } from "lucide-react";

export default function AccessControl({ clientAppId }) {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("viewer");
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const baseRoles = [
        { name: "admin", permissions: { manage_apps: true, manage_rbac: true, manage_billing: true, manage_compliance: true, view_audit_logs: true, view_profiles: true, view_insights: true, manage_engagements: true }, is_system: true },
        { name: "analyst", permissions: { view_profiles: true, view_insights: true }, is_system: true },
        { name: "viewer", permissions: { view_profiles: true, view_insights: true }, is_system: true }
      ];
      const custom = await base44.entities.RoleTemplate.list();
      setRoles([ ...baseRoles, ...custom ]);
      setIsLoading(false);
    })();
  }, []);

  const loadUsers = useCallback(async (appId) => {
    if (!appId) {
        setUsers([]);
        return;
    }
    const list = await base44.entities.UserAppAccess.filter({ client_app_id: appId });
    setUsers(list);
  }, []);

  useEffect(() => {
    if (clientAppId) loadUsers(clientAppId);
  }, [clientAppId, loadUsers]);

  const handleAdd = async () => {
    if (!email || !roleName || !clientAppId) return;
    setSaving(true);
    await base44.functions.invoke('updateUserAccess', { op: "create", payload: { client_app_id: clientAppId, user_email: email.trim(), role_name: roleName, status: "invited" } });
    await base44.functions.invoke('logAudit', { action: "access.assign_role", target_type: "UserAppAccess", target_id: email, details: { role: roleName, client_app_id: clientAppId } });
    setEmail("");
    await loadUsers(clientAppId);
    setSaving(false);
  };

  const handleRoleChange = async (member, newRole) => {
    await base44.functions.invoke('updateUserAccess', { op: "update", id: member.id, payload: { role_name: newRole, status: member.status } });
    await loadUsers(clientAppId);
  };

  const handleRemove = async (member) => {
    if (!confirm(`Revoke access for ${member.user_email}?`)) return;
    await base44.functions.invoke('updateUserAccess', { op: "delete", id: member.id });
    await loadUsers(clientAppId);
  };

  const isRoleChecked = useCallback((roleName) => {
    return selectedUser?.role_name === roleName;
  }, [selectedUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
      </div>
    );
  }

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-6">
        <CardTitle className="flex items-center gap-2 text-white">
          <Shield className="w-5 h-5 text-[#00d4ff]" />
          Access Control (RBAC)
        </CardTitle>
        <CardDescription className="text-[#a3a3a3]">Assign roles and manage team access per application.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-[#a3a3a3]">User Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@company.com" className="bg-[#1a1a1a] border-[#262626] text-white" />
          </div>
          <div>
            <label className="text-sm text-[#a3a3a3]">Role</label>
            <Select value={roleName} onValueChange={setRoleName}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAdd} disabled={saving || !email || !clientAppId} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Add/Invite
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-[#a3a3a3]">No team members yet.</p>
          ) : (
            users.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#262626] rounded-lg">
                <div>
                  <div className="text-white font-medium">{m.user_email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">{m.role_name}</Badge>
                    <Badge className={`border ${m.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' : 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30'}`}>{m.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={m.role_name} onValueChange={(v) => handleRoleChange(m, v)}>
                    <SelectTrigger className="w-32 bg-[#0f0f0f] border-[#262626] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={`${m.id}-${r.name}`} value={r.name}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => handleRemove(m)} className="text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}