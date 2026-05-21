import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, CheckCircle, ArrowRight, ExternalLink, FileText, Download, Receipt } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';

const plans = [
    {
        key: 'developer',
        name: 'Developer',
        price: 'Free',
        features: ['Up to 1,000 Active User Profiles', '5,000 events/month', 'Core psychographic profiling', 'Community support'],
    },
    {
        key: 'growth',
        name: 'Growth',
        price: '$149/mo',

        features: ['Up to 25,000 Active User Profiles', 'Full journey builder & A/B testing', 'Real-time engagement engine', 'Priority support (12-hr SLA)'],
    },
    {
        key: 'pro',
        name: 'Professional',
        price: '$499/mo',
        features: ['Up to 100,000 Active User Profiles', 'Predictive analytics & churn prevention', 'Full API access & market intelligence', 'Priority support'],
    }
];

function formatAmount(amount, currency) {
    const value = (amount / 100).toFixed(2);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency?.toUpperCase() || 'USD' }).format(value);
}

function formatDate(ts) {
    return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_STYLES = {
    paid:       'bg-green-500/10 text-green-400 border-green-500/20',
    open:       'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    void:       'bg-[#262626] text-[#6b7280] border-[#333]',
    uncollectible: 'bg-red-500/10 text-red-400 border-red-500/20',
    draft:      'bg-[#262626] text-[#6b7280] border-[#333]',
};

export default function BillingPanel() {
    const [subscription, setSubscription] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [invoicesLoading, setInvoicesLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadSubscription = async () => {
            setIsLoading(true);
            try {
                const user = await base44.auth.me();
                await base44.functions.invoke('ensureBillingSubscription', {}).catch(() => null);
                const subs = await base44.entities.BillingSubscription.filter({ user_id: user.id }, null, 1);
                const sub = subs[0] || null;
                setSubscription(sub);

                // Fetch invoices if a Stripe customer exists
                if (sub?.stripe_customer_id) {
                    setInvoicesLoading(true);
                    base44.functions.invoke('getStripeInvoices', {})
                        .then(({ data }) => setInvoices(data?.invoices || []))
                        .catch(() => setInvoices([]))
                        .finally(() => setInvoicesLoading(false));
                }
            } catch (e) {
                console.error("BillingPanel Error:", e);
                setSubscription(null);
            } finally {
                setIsLoading(false);
            }
        };
        loadSubscription();
    }, []);

    const handlePlanSelect = async (planKey) => {
        setIsProcessing(true);
        try {
            const { data } = await base44.functions.invoke('createCheckout', { plan_key: planKey });
            if (data.checkout_url || data.url) {
                window.location.href = data.checkout_url || data.url;
            } else if (data.redirect_url) {
                toast({ title: 'Success', description: data.message || 'Your plan has been updated.' });
                window.location.href = data.redirect_url;
            } else if (data.status === 'success') {
                toast({ title: 'Success', description: data.message || 'Your plan has been updated.' });
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

            {/* ── Invoice History ─────────────────────────────────────── */}
            <div className="mt-10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Receipt className="w-5 h-5 text-[#00d4ff]" />
                    Invoice History
                </h3>

                {invoicesLoading ? (
                    <div className="flex items-center gap-3 text-[#6b7280] text-sm p-6 bg-[#111111] rounded-lg border border-[#262626]">
                        <div className="w-4 h-4 border-2 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
                        Loading invoices...
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="p-6 bg-[#111111] rounded-lg border border-[#262626] text-center">
                        <FileText className="w-8 h-8 text-[#404040] mx-auto mb-2" />
                        <p className="text-[#6b7280] text-sm">
                            {subscription?.stripe_customer_id
                                ? 'No invoices found.'
                                : 'Invoices will appear here after your first payment.'}
                        </p>
                    </div>
                ) : (
                    <div className="rounded-lg border border-[#262626] overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#1a1a1a] border-b border-[#262626]">
                                    <th className="text-left px-4 py-3 text-[#6b7280] font-medium">Date</th>
                                    <th className="text-left px-4 py-3 text-[#6b7280] font-medium hidden sm:table-cell">Invoice #</th>
                                    <th className="text-left px-4 py-3 text-[#6b7280] font-medium hidden md:table-cell">Description</th>
                                    <th className="text-right px-4 py-3 text-[#6b7280] font-medium">Amount</th>
                                    <th className="text-center px-4 py-3 text-[#6b7280] font-medium">Status</th>
                                    <th className="text-center px-4 py-3 text-[#6b7280] font-medium">PDF</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv, i) => (
                                    <tr
                                        key={inv.id}
                                        className={`border-b border-[#1e1e1e] hover:bg-[#161616] transition-colors ${i === invoices.length - 1 ? 'border-b-0' : ''}`}
                                    >
                                        <td className="px-4 py-3 text-[#a3a3a3] whitespace-nowrap">{formatDate(inv.date)}</td>
                                        <td className="px-4 py-3 text-[#6b7280] font-mono text-xs hidden sm:table-cell">{inv.number || '—'}</td>
                                        <td className="px-4 py-3 text-[#6b7280] hidden md:table-cell truncate max-w-[200px]">
                                            {inv.description || 'Subscription'}
                                        </td>
                                        <td className="px-4 py-3 text-white font-medium text-right whitespace-nowrap">
                                            {formatAmount(inv.amount_paid || inv.amount_due, inv.currency)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border capitalize ${STATUS_STYLES[inv.status] || STATUS_STYLES.draft}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {inv.invoice_pdf ? (
                                                <a
                                                    href={inv.invoice_pdf}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-[#262626] text-[#00d4ff] hover:text-white transition-colors"
                                                    title="Download PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            ) : inv.hosted_invoice_url ? (
                                                <a
                                                    href={inv.hosted_invoice_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-[#262626] text-[#6b7280] hover:text-white transition-colors"
                                                    title="View Invoice"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            ) : (
                                                <span className="text-[#404040]">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}