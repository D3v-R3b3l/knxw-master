
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Org, OrgUser, TenantWorkspace } from "@/entities/all";
import { validateOrgAccess } from "@/functions/validateOrgAccess";
import { auditLogger } from "@/functions/auditLogger";
import { Users, Building, Shield, Plus, Trash2, Edit } from "lucide-react";

export default function OrgManagement({ onOrgSelected }) {
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("member");

  useEffect(() => {
    loadOrgs();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadOrgData(selectedOrg.id);
      if (onOrgSelected) {
        onOrgSelected(selectedOrg);
      }
    } else {
       if (onOrgSelected) {
        onOrgSelected(null);
      }
    }
  }, [selectedOrg, onOrgSelected]); // Added onOrgSelected to dependency array

  const loadOrgs = async () => {
    try {
      const orgsData = await Org.list();
      setOrgs(orgsData);
      if (orgsData.length > 0) {
        setSelectedOrg(orgsData[0]);
      }
    } catch (error) {
      console.error('Error loading orgs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrgData = async (orgId) => {
    try {
      // Validate access first
      const { data: accessData } = await validateOrgAccess({ 
        orgId, 
        requiredRole: 'admin' 
      });
      
      if (!accessData.success) {
        throw new Error('Insufficient permissions');
      }

      // Load org users and workspaces
      const [usersData, workspacesData] = await Promise.all([
        OrgUser.filter({ org_id: orgId }),
        TenantWorkspace.filter({ org_id: orgId })
      ]);

      setOrgUsers(usersData);
      setWorkspaces(workspacesData);
    } catch (error) {
      console.error('Error loading org data:', error);
    }
  };

  const addUser = async () => {
    if (!newUserEmail || !selectedOrg) return;

    try {
      const newUser = await OrgUser.create({
        org_id: selectedOrg.id,
        user_email: newUserEmail,
        role: newUserRole,
        status: 'invited'
      });

      // Log the action
      await auditLogger({
        action: 'create',
        tableName: 'OrgUser',
        recordId: newUser.id,
        after: newUser,
        orgId: selectedOrg.id
      });

      setNewUserEmail("");
      setNewUserRole("member");
      loadOrgData(selectedOrg.id);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const user = orgUsers.find(u => u.id === userId);
      const updatedUser = await OrgUser.update(userId, { role: newRole });

      // Log the action
      await auditLogger({
        action: 'update',
        tableName: 'OrgUser',
        recordId: userId,
        before: user,
        after: updatedUser,
        orgId: selectedOrg.id
      });

      loadOrgData(selectedOrg.id);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const removeUser = async (userId) => {
    if (!confirm('Remove this user from the organization?')) return;

    try {
      const user = orgUsers.find(u => u.id === userId);
      await OrgUser.delete(userId);

      // Log the action
      await auditLogger({
        action: 'delete',
        tableName: 'OrgUser',
        recordId: userId,
        before: user,
        orgId: selectedOrg.id
      });

      loadOrgData(selectedOrg.id);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30';
      case 'admin': return 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30';
      case 'member': return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
      case 'viewer': return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
      default: return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Selector */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Building className="w-5 h-5 text-[#00d4ff]" />
            Organization Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedOrg?.id || ""} onValueChange={(id) => setSelectedOrg(orgs.find(o => o.id === id))}>
            <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {orgs.map((org) => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedOrg && (
        <>
          {/* Organization Users */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-[#00d4ff]" />
                Users ({orgUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add User Form */}
              <div className="flex gap-3">
                <Input
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                />
                <Select value={newUserRole} onValueChange={setNewUserRole}>
                  <SelectTrigger className="w-32 bg-[#1a1a1a] border-[#262626] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addUser} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>

              {/* Users List */}
              <div className="space-y-2">
                {orgUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#262626] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-[#0a0a0a]" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.user_email}</div>
                        <div className="text-sm text-[#a3a3a3]">
                          Status: {user.status} • 
                          {user.last_active && ` Last active: ${new Date(user.last_active).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Select value={user.role} onValueChange={(role) => updateUserRole(user.id, role)}>
                        <SelectTrigger className="w-24 bg-[#0f0f0f] border-[#262626] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="icon" variant="ghost" onClick={() => removeUser(user.id)} className="text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workspaces */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-[#00d4ff]" />
                Workspaces ({workspaces.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.map((workspace) => (
                  <Card key={workspace.id} className="bg-[#1a1a1a] border-[#262626]">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-white mb-2">{workspace.name}</h4>
                      {workspace.description && (
                        <p className="text-sm text-[#a3a3a3] mb-2">{workspace.description}</p>
                      )}
                      <Badge className={workspace.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' : 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'}>
                        {workspace.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
