import React, { useState, Suspense } from 'react';
import HeadManager from '../components/HeadManager';
import { Shield, KeyRound, Link as LinkIcon, CreditCard, Files, BookUser, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load the panels for better performance
const AccessControlPanel = React.lazy(() => import('../components/settings/AccessControlPanel'));
const SSOPanel = React.lazy(() => import('../components/settings/SSOPanel'));
const IdentityPanel = React.lazy(() => import('../components/settings/IdentityPanel'));
const BillingPanel = React.lazy(() => import('../components/settings/BillingPanel'));
const CompliancePanel = React.lazy(() => import('../components/settings/CompliancePanel'));
const AuditLogPanel = React.lazy(() => import('../components/settings/AuditLogPanel'));

const navItems = [
  { id: 'access', label: 'Access Control', icon: Shield, component: AccessControlPanel },
  { id: 'sso', label: 'Single Sign-On (SSO)', icon: KeyRound, component: SSOPanel },
  { id: 'identity', label: 'Identity Management', icon: LinkIcon, component: IdentityPanel },
  { id: 'billing', label: 'Billing & Subscriptions', icon: CreditCard, component: BillingPanel },
  { id: 'compliance', label: 'Compliance & Data', icon: Files, component: CompliancePanel },
  { id: 'audit', label: 'Audit Logs', icon: BookUser, component: AuditLogPanel },
];

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-[#00d4ff]"></div>
  </div>
);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'access';
  });

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, []);

  const ActiveComponent = navItems.find(item => item.id === activeTab)?.component;

  return (
    <>
      <HeadManager
        title="Settings & Administration - knXw"
        description="Manage your organization's access, security, billing, and data configurations."
      />
      <div className="min-h-screen bg-[#0a0a0a] text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-[#00d4ff]" />
              Settings & Administration
            </h1>
            <p className="mt-2 text-lg text-gray-400">
              Manage your organization's access, security, billing, and data configurations.
            </p>
          </header>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Left Navigation */}
            <aside className="md:col-span-1">
              <nav className="space-y-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                      activeTab === item.id
                        ? 'bg-[#1a1a1a] text-white shadow-sm'
                        : 'text-gray-400 hover:bg-[#151515] hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-[#00d4ff]' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Right Content Panel */}
            <main className="md:col-span-3 min-h-[400px]">
               <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    {ActiveComponent && <ActiveComponent />}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}