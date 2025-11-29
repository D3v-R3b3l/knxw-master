
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ClientApp } from '@/entities/ClientApp';
import { User } from '@/entities/User';
import { RoleTemplate } from '@/entities/RoleTemplate';
import { UserAppAccess } from '@/entities/UserAppAccess';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Shield, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccessControlPanel() {
    const [accessList, setAccessList] = useState([]);
    const [apps, setApps] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [accessData, appData, roleData] = await Promise.all([
                UserAppAccess.list('-created_date'),
                ClientApp.list(),
                RoleTemplate.list()
            ]);
            setAccessList(accessData);
            setApps(appData);
            setRoles(roleData);
        } catch (e) {
            toast({ variant: "destructive", title: "Failed to load data", description: e.message });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onSubmit = async (data) => {
        try {
            const existingRecords = await UserAppAccess.filter({ client_app_id: data.application, user_email: data.user_email }, null, 1);
            const existing = existingRecords[0] || null;
            if (existing) {
                toast({ variant: "destructive", title: "Duplicate Entry", description: "This user already has a role assigned for this application." });
                return;
            }
            await UserAppAccess.create({
                client_app_id: data.application,
                user_email: data.user_email,
                role_name: data.role,
                status: 'active'
            });
            toast({ title: "Success", description: "User access has been granted." });
            reset({ application: '', user_email: '', role: '' });
            fetchData();
        } catch (e) {
            toast({ variant: "destructive", title: "Failed to grant access", description: e.message });
        }
    };
    
    const handleDelete = async (accessId) => {
        try {
            await UserAppAccess.delete(accessId);
            toast({ title: "Success", description: "User access has been revoked." });
            fetchData();
        } catch (e) {
            toast({ variant: "destructive", title: "Failed to revoke access", description: e.message });
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                    <Shield className="w-6 h-6 text-[#00d4ff]" />
                    Access Control (RBAC)
                </h2>
                <p className="text-gray-400">Assign roles and manage team access per application.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-6 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                <div className="col-span-1">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Application</label>
                    <Controller
                        name="application"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                             <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="bg-[#0a0a0a] border-[#3a3a3a]"><SelectValue placeholder="Select an app..." /></SelectTrigger>
                                <SelectContent>
                                    {apps.map(app => <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="col-span-1">
                     <label className="text-sm font-medium text-gray-300 mb-2 block">User Email</label>
                    <Input {...register("user_email", { required: true })} placeholder="user@company.com" className="bg-[#0a0a0a] border-[#3a3a3a]" />
                </div>
                <div className="col-span-1">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Role</label>
                     <Controller
                        name="role"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                             <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="bg-[#0a0a0a] border-[#3a3a3a]"><SelectValue placeholder="Select a role..." /></SelectTrigger>
                                <SelectContent>
                                    {roles.map(role => <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                 <div className="col-span-1">
                    <Button type="submit" className="w-full bg-[#00d4ff] hover:bg-[#00b8e0] text-black font-bold">
                        <PlusCircle className="w-4 h-4 mr-2"/>
                        Add/Invite
                    </Button>
                </div>
            </form>

            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Current Team Members</h3>
                <div className="space-y-3">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                    ) : accessList.length > 0 ? (
                        accessList.map(access => (
                            <div key={access.id} className="flex justify-between items-center p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                                <div>
                                    <p className="font-semibold text-white">{access.user_email}</p>
                                    <p className="text-sm text-gray-400">
                                        Role: <span className="font-medium text-gray-300">{access.role_name}</span> on App <span className="font-medium text-gray-300">{apps.find(a => a.id === access.client_app_id)?.name || '...'}</span>
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(access.id)}>
                                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-400" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 px-4 bg-[#1a1a1a] rounded-lg border border-dashed border-[#262626]">
                            <p className="text-gray-400">No team members yet.</p>
                            <p className="text-sm text-gray-500">Use the form above to invite your first team member.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
