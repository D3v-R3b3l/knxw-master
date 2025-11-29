
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Files, Send, Eraser } from 'lucide-react';
import { ConfigCenter } from '@/entities/ConfigCenter';
import { User } from '@/entities/User';
import { requestDataDeletion } from '@/functions/requestDataDeletion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CompliancePanel() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { register: dsarRegister, handleSubmit: dsarHandleSubmit, reset: dsarReset } = useForm();
    const [retentionDays, setRetentionDays] = useState(90);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                
                // Use a fallback org_id if current_org_id is not available, remove currentUser.id as it's not an org_id
                const orgId = currentUser.current_org_id || 'default';
                
                let config;
                try {
                    // findOne can return null if not found, which is a valid case
                    config = await ConfigCenter.findOne({ tenant_id: orgId });
                } catch (configError) {
                    // Catch errors if the table doesn't exist or RLS fails
                    console.warn('ConfigCenter access failed, using defaults:', configError);
                    config = null;
                }
                
                if (config && config.log_retention_days) {
                    setRetentionDays(config.log_retention_days);
                    reset({ retention_days: config.log_retention_days });
                } else {
                    // Set default values if no config is found
                    setRetentionDays(90);
                    reset({ retention_days: 90 });
                }
            } catch (e) {
                console.error('Failed to load user or compliance settings:', e);
                toast({ 
                    variant: 'destructive', 
                    title: 'Error', 
                    description: 'Could not load compliance settings. Using default values.' 
                });
                // Set default values even on error
                setRetentionDays(90);
                reset({ retention_days: 90 });
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, [reset, toast]);

    const onRetentionSubmit = async (data) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not loaded.' });
            return;
        }

        try {
            // Remove user.id as it's not an org_id
            const orgId = user.current_org_id || 'default';
            const payload = { 
                log_retention_days: Number(data.retention_days),
                updated_at: new Date().toISOString(),
                updated_by: user.email 
            };
            
            let config;
            try {
                config = await ConfigCenter.findOne({ tenant_id: orgId });
            } catch {
                config = null;
            }
            
            if (config) {
                await ConfigCenter.update(config.id, payload);
            } else {
                await ConfigCenter.create({ 
                    tenant_id: orgId, 
                    ...payload 
                });
            }
            
            setRetentionDays(Number(data.retention_days));
            toast({ title: 'Success', description: 'Data retention policy updated.' });
        } catch (e) {
            console.error('Failed to update retention policy:', e);
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: `Failed to update policy: ${e.message}` 
            });
        }
    };

    const onDsarSubmit = async (data) => {
        try {
            const response = await requestDataDeletion({ 
                subject_identifier: data.subject_identifier, 
                reason: data.reason 
            });
            
            if (response.data.success) {
                toast({ 
                    title: 'Request Submitted', 
                    description: 'Data deletion request has been successfully submitted for processing.' 
                });
                dsarReset();
                setDialogOpen(false);
            } else {
                throw new Error(response.data.error || 'Request failed');
            }
        } catch (e) {
            console.error('DSAR submission failed:', e);
            toast({ 
                variant: 'destructive', 
                title: 'Submission Failed', 
                description: e.message || 'Failed to submit data deletion request.' 
            });
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                <Files className="w-6 h-6 text-[#00d4ff]" />
                Compliance & Data
            </h2>
            <p className="text-gray-400 mb-6">Manage data retention policies and handle data subject requests (DSAR).</p>
            
            <div className="space-y-8">
                {/* Data Retention Policy */}
                <div className="p-6 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                    <h3 className="font-semibold text-white mb-2">Data Retention Policy</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Set the number of days to retain audit and access logs. Older logs will be automatically archived.
                    </p>
                    <form onSubmit={handleSubmit(onRetentionSubmit)} className="flex items-end gap-4">
                        <div className="flex-grow">
                            <Label htmlFor="retention_days" className="text-sm font-medium text-gray-300">
                                Retention Period (days)
                            </Label>
                            <Input
                                id="retention_days"
                                type="number"
                                {...register('retention_days', { 
                                    required: true, 
                                    min: 30, 
                                    max: 3650,
                                    valueAsNumber: true 
                                })}
                                className="mt-1 bg-[#0a0a0a] border-[#3a3a3a] text-white"
                                disabled={isLoading}
                            />
                            {errors.retention_days && (
                                <p className="text-red-400 text-xs mt-1">
                                    Must be between 30 and 3650 days
                                </p>
                            )}
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Save Policy'}
                        </Button>
                    </form>
                </div>

                {/* Data Subject Access Requests (DSAR) */}
                <div className="p-6 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                    <h3 className="font-semibold text-white mb-2">Data Deletion Request (DSAR)</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Submit a request to delete all data associated with a specific user ID or email, 
                        in compliance with regulations like GDPR and CCPA.
                    </p>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive">
                                <Eraser className="w-4 h-4 mr-2" />
                                New Deletion Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-[#111111] border-[#262626]">
                            <DialogHeader>
                                <DialogTitle className="text-white">Request Data Deletion</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    This action is irreversible. All data for the specified user will be permanently 
                                    deleted after processing.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={dsarHandleSubmit(onDsarSubmit)} className="grid gap-4 py-4">
                                <div>
                                    <Label htmlFor="subject_identifier" className="text-gray-300">
                                        User Email or ID
                                    </Label>
                                    <Input 
                                        id="subject_identifier" 
                                        {...dsarRegister('subject_identifier', { 
                                            required: 'This field is required.' 
                                        })} 
                                        className="mt-1 bg-[#0a0a0a] border-[#3a3a3a] text-white" 
                                        placeholder="user@example.com or user_123"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reason" className="text-gray-300">
                                        Reason for Deletion
                                    </Label>
                                    <Input 
                                        id="reason" 
                                        {...dsarRegister('reason', { 
                                            required: 'A reason is required for auditing purposes.' 
                                        })} 
                                        className="mt-1 bg-[#0a0a0a] border-[#3a3a3a] text-white" 
                                        placeholder="GDPR request, account closure, etc."
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" variant="destructive">
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit Request
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
