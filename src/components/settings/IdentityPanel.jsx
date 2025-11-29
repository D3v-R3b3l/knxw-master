
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Link as LinkIcon, Save } from 'lucide-react';
import { ConfigCenter } from '@/entities/ConfigCenter';
import { User } from '@/entities/User';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export default function IdentityPanel() {
    const { control, handleSubmit, reset } = useForm();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        const loadConfig = async () => {
            setIsLoading(true);
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                const orgId = currentUser.current_org_id || 'default';
                let config = null;
                try {
                    // Attempt to find the config, but don't fail if it doesn't exist.
                    const configs = await ConfigCenter.filter({ tenant_id: orgId }, null, 1);
                    config = configs[0] || null;
                } catch(e) {
                     console.warn("Could not find ConfigCenter record, using defaults.");
                }

                if (config && config.identity_resolution_strategy) {
                    reset({ strategy: config.identity_resolution_strategy });
                } else {
                     reset({ strategy: 'email_first' });
                }
            } catch (e) {
                // This will catch errors from User.me() or other unexpected issues.
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load identity settings.' });
                reset({ strategy: 'email_first' }); // Ensure form has a default on error
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, [reset, toast]);
    
    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const orgId = user.current_org_id || 'default';
            const configs = await ConfigCenter.filter({ tenant_id: orgId }, null, 1);
            const config = configs[0] || null;

            const payload = { 
                identity_resolution_strategy: data.strategy,
                tenant_id: orgId,
                updated_by: user.email,
                updated_at: new Date().toISOString()
            };

            if (config) {
                await ConfigCenter.update(config.id, payload);
            } else {
                await ConfigCenter.create(payload);
            }
            toast({ title: 'Success', description: 'Identity resolution strategy updated.' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to update strategy: ${e.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                <LinkIcon className="w-6 h-6 text-[#00d4ff]" />
                Identity Management
            </h2>
            <p className="text-gray-400 mb-6">Manage how user identities are resolved and merged across different platforms.</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                <h3 className="font-semibold text-white mb-2">Identity Resolution Strategy</h3>
                <p className="text-sm text-gray-400 mb-4">Choose the primary method for merging anonymous user profiles with known identities upon authentication or identification.</p>
                
                <div className="max-w-md space-y-2">
                     <Label htmlFor="strategy">Resolution Strategy</Label>
                     <Controller
                        name="strategy"
                        control={control}
                        render={({ field }) => (
                             <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                <SelectTrigger id="strategy" className="bg-[#0a0a0a] border-[#3a3a3a]">
                                    <SelectValue placeholder="Select a strategy..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="email_first">Email First</SelectItem>
                                    <SelectItem value="authenticated_id">Authenticated ID</SelectItem>
                                    <SelectItem value="device_id_fallback">Device ID Fallback</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="mt-6">
                    <Button type="submit" disabled={isLoading}><Save className="w-4 h-4 mr-2" />{isLoading ? 'Saving...' : 'Save Strategy'}</Button>
                </div>
            </form>
        </div>
    );
}
