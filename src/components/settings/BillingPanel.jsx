import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const plans = [
    {
        key: 'developer',
        name: 'Developer',
        price: 'Free',
        features: ['1,000 monthly credits', 'Basic psychographic profiling', 'Standard integrations', 'Community support'],
    },
    {
        key: 'growth',
        name: 'Growth',
        price: '$99/mo',
        features: ['10,000 monthly credits', 'Advanced profiling & segmentation', 'Adaptive Engagement Engine', 'Email support'],
    },
    {
        key: 'pro',
        name: 'Pro',
        price: '$499/mo',
        features: ['50,000 monthly credits', 'Full API access & AI agents', 'Advanced analytics & reporting', 'Priority support'],
    }
];

export default function BillingPanel() {
    const [subscription, setSubscription] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadSubscription = async () => {
            setIsLoading(true);
            try {
                const user = await base44.auth.me();
                const subs = await base44.entities.BillingSubscription.filter({ user_id: user.id }, null, 1);
                const sub = subs[0] || null;
                setSubscription(sub);
            } catch (e) {
                console.error("BillingPanel Error:", e);
                // Don't annoy user with error toast on load if they just don't have a sub yet
                setSubscription(null);
            } finally {
                setIsLoading(false);
            }
        };
        loadSubscription();
    }, [toast]);

    const handlePlanSelect = async (planKey) => {
        setIsProcessing(true);
        try {
            const { data } = await base44.functions.invoke('createCheckout', { plan_key: planKey });
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else if (data.status === 'success') {
                toast({ title: 'Success', description: 'Your plan has been updated.' });
                window.location.reload();
            }
        } catch (e) {
            console.error("Checkout error:", e);
            toast({ variant: 'destructive', title: 'Error', description: `Could not process plan change: ${e.message}` });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleManageSubscription = async () => {
        setIsProcessing(true);
        try {
            const { data } = await base44.functions.invoke('createPortalSession', {});
            if(data.url) {
                window.location.href = data.url;
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: `Could not open management portal: ${e.message}` });
        } finally {
            setIsProcessing(false);
        }
    };

    const currentPlanKey = subscription?.plan_key || 'developer';

    if (isLoading) {
        return <div className="p-6 text-center text-gray-400">Loading billing details...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                <CreditCard className="w-6 h-6 text-[#00d4ff]" />
                Billing & Subscriptions
            </h2>
            <p className="text-gray-400 mb-6">Manage your subscription, view invoices, and update payment methods.</p>

            <div className="mb-8 p-6 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                 <h3 className="font-semibold text-white">Current Plan</h3>
                 <div className="flex justify-between items-center mt-2">
                    <p className="text-xl font-bold text-[#00d4ff] capitalize">{currentPlanKey}</p>
                    <Button onClick={handleManageSubscription} disabled={isProcessing || currentPlanKey === 'developer'}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Manage Subscription
                    </Button>
                 </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.key} className={`p-6 rounded-lg border-2 flex flex-col ${currentPlanKey === plan.key ? 'border-[#00d4ff]' : 'border-[#262626]'} bg-[#111111]`}>
                        <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                        <p className="text-2xl font-extrabold text-[#00d4ff] my-4">{plan.price}</p>
                        <ul className="space-y-3 text-sm text-gray-300 flex-grow">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6">
                            {currentPlanKey === plan.key ? (
                                <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                            ) : (
                                <Button onClick={() => handlePlanSelect(plan.key)} className="w-full" disabled={isProcessing}>
                                    {plan.key === 'developer' ? 'Downgrade' : 'Upgrade'} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}