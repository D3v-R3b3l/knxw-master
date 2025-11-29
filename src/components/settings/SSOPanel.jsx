
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { SSOProviderConfig } from '@/entities/SSOProviderConfig';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

export default function SSOPanel() {
    const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm();
    const [providers, setProviders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const loadProviders = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await SSOProviderConfig.list();
            setProviders(data);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load SSO providers.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadProviders();
    }, [loadProviders]);

    const onAddSubmit = async (data) => {
        try {
            await SSOProviderConfig.create(data);
            toast({ title: 'Success', description: 'SSO provider added.' });
            await loadProviders();
            reset();
            setIsDialogOpen(false);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to add provider: ${e.message}` });
        }
    };
    
    const toggleProvider = async (provider, active) => {
        try {
            await SSOProviderConfig.update(provider.id, { active });
            toast({ title: 'Success', description: `${provider.display_name} has been ${active ? 'enabled' : 'disabled'}.` });
            await loadProviders();
        } catch (e) {
             toast({ variant: 'destructive', title: 'Error', description: `Failed to update provider: ${e.message}` });
        }
    };
    
     const deleteProvider = async (providerId) => {
        try {
            await SSOProviderConfig.delete(providerId);
            toast({ title: 'Success', description: 'SSO provider has been deleted.' });
            await loadProviders();
        } catch (e) {
             toast({ variant: 'destructive', title: 'Error', description: `Failed to delete provider: ${e.message}` });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                        <KeyRound className="w-6 h-6 text-[#00d4ff]" />
                        Single Sign-On (SSO)
                    </h2>
                    <p className="text-gray-400">Configure SSO for your organization with providers like Okta, Azure AD, or Google.</p>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" />Add Provider</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#111] border-[#262626]">
                         <DialogHeader>
                            <DialogTitle className="text-white">Add SSO Provider</DialogTitle>
                             <DialogDescription>
                                Add a new SAML or OIDC provider for your organization.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="provider" className="text-gray-300">Provider</Label>
                                <Controller
                                    name="provider"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                         <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="provider" className="mt-1 bg-[#0a0a0a] border-[#3a3a3a]"><SelectValue placeholder="Select a provider" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="okta">Okta</SelectItem>
                                                <SelectItem value="azuread">Azure AD</SelectItem>
                                                <SelectItem value="google">Google Workspace</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                             <div>
                                <Label htmlFor="display_name" className="text-gray-300">Display Name</Label>
                                <Input id="display_name" {...register('display_name')} className="mt-1 bg-[#0a0a0a] border-[#3a3a3a]" />
                            </div>
                             <div>
                                <Label htmlFor="metadata_url" className="text-gray-300">Metadata URL (SAML) or Issuer URL (OIDC)</Label>
                                <Input id="metadata_url" {...register('metadata_url')} className="mt-1 bg-[#0a0a0a] border-[#3a3a3a]" />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Provider'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                     Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full bg-[#1a1a1a]" />)
                ) : providers.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-[#1a1a1a] rounded-lg border border-dashed border-[#262626]">
                        <p className="text-gray-300">No SSO providers configured.</p>
                        <p className="text-sm text-gray-500">Click "Add Provider" to get started.</p>
                    </div>
                ) : (
                    providers.map(provider => (
                        <div key={provider.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                            <div>
                                <p className="font-semibold text-white">{provider.display_name}</p>
                                <p className="text-sm text-gray-400 capitalize">{provider.provider}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={provider.active}
                                        onCheckedChange={(checked) => toggleProvider(provider, checked)}
                                        aria-label={`Toggle ${provider.display_name}`}
                                    />
                                    <Label className={provider.active ? 'text-green-400' : 'text-gray-400'}>
                                        {provider.active ? 'Enabled' : 'Disabled'}
                                    </Label>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteProvider(provider.id)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
