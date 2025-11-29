
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Settings, 
  Eye, 
  BarChart3, 
  Target, 
  X, 
  Check, 
  Info,
  Cookie,
  Brain
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const CONSENT_STORAGE_KEY = 'knxw_consent_preferences';
const CONSENT_TIMESTAMP_KEY = 'knxw_consent_timestamp';

// Cookie categories with clear descriptions
const COOKIE_CATEGORIES = {
  necessary: {
    name: 'Strictly Necessary',
    description: 'These cookies are essential for the website to function and cannot be switched off.',
    icon: Shield,
    required: true,
    examples: ['Session management', 'Security features', 'Basic functionality']
  },
  analytics: {
    name: 'Analytics & Performance',
    description: 'These cookies provide insight into how the site is used, helping us improve reliability, speed, and overall user experience. Data is collected in a way that avoids directly identifying individual visitors.',
    icon: BarChart3,
    required: false,
    examples: ['page visits', 'time on site', 'navigation paths', 'technical diagnostics']
  },
  personalization: {
    name: 'Enhanced Experience (AI Demo)',
    description: 'These cookies help our AI personalize the demo experience so you can see the platform’s full capabilities in action.',
    icon: Brain,
    required: false,
    examples: ['usage patterns', 'content relevance', 'saved preferences', 'interaction style indicators'],
    highlight: true // This is our main value proposition
  },
  marketing: {
    name: 'Marketing & Targeting',
    description: 'These cookies are used to make advertising messages more relevant to you and track campaign performance.',
    icon: Target,
    required: false,
    examples: ['Ad targeting', 'Campaign tracking', 'Social media integration']
  }
};

const CookieConsentBanner = ({ onConsentChange }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    analytics: false,
    personalization: false,
    marketing: false
  });
  const [hasConsented, setHasConsented] = useState(false);

  const checkConsentStatus = useCallback(() => {
    try {
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
      const timestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);
      
      if (saved && timestamp) {
        const consentAge = Date.now() - parseInt(timestamp);
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        
        if (consentAge < thirtyDays) {
          // Valid consent exists
          const savedPreferences = JSON.parse(saved);
          setPreferences(savedPreferences);
          setHasConsented(true);
          onConsentChange?.(savedPreferences);
          return;
        }
      }
      
      // No valid consent - show banner
      setShowBanner(true);
    } catch (error) {
      console.error('Error checking consent status:', error);
      setShowBanner(true);
    }
  }, [onConsentChange]);

  useEffect(() => {
    checkConsentStatus();
  }, [checkConsentStatus]);

  const saveConsent = useCallback((consentPreferences) => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentPreferences));
      localStorage.setItem(CONSENT_TIMESTAMP_KEY, Date.now().toString());
      
      setPreferences(consentPreferences);
      setHasConsented(true);
      setShowBanner(false);
      setShowDetails(false);
      
      onConsentChange?.(consentPreferences);
      
      // Dispatch event for other components to react to consent changes
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
        detail: consentPreferences
      }));
    } catch (error) {
      console.error('Error saving consent preferences:', error);
    }
  }, [onConsentChange]);

  const handleAcceptAll = useCallback(() => {
    const allConsent = {
      necessary: true,
      analytics: true,
      personalization: true,
      marketing: true
    };
    saveConsent(allConsent);
  }, [saveConsent]);

  const handleAcceptNecessary = useCallback(() => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      personalization: false,
      marketing: false
    };
    saveConsent(necessaryOnly);
  }, [saveConsent]);

  const handleSavePreferences = useCallback(() => {
    saveConsent(preferences);
  }, [saveConsent, preferences]);

  const handleCategoryToggle = useCallback((category) => {
    if (category === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  if (hasConsented && !showDetails) {
    return null;
  }

  return (
    <>
      {/* Main Consent Banner */}
      <AnimatePresence>
        {showBanner && !showDetails && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-xl"
          >
            <div className="max-w-6xl mx-auto">
              <Card className="bg-[#111111]/90 border-[#262626] shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-xl flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-[#0a0a0a]" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Your Privacy Matters
                      </h3>
                      <p className="text-[#a3a3a3] mb-4 leading-relaxed">
                        We use cookies and similar technologies to improve site performance and to demonstrate the capabilities of our psychographic intelligence platform. By clicking “Experience Personalization”, you agree to take part in our live demo, where the system adapts content in real time based on your interactions.
                      </p>
                      
                      <div className="flex flex-wrap gap-3 items-center">
                        <Button
                          onClick={handleAcceptAll}
                          className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-[#0a0a0a] font-bold shadow-xl"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Experience Personalization
                        </Button>
                        
                        <Button
                          onClick={handleAcceptNecessary}
                          variant="outline"
                          className="border-[#404040] text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]"
                        >
                          Essential Only
                        </Button>
                        
                        <Button
                          onClick={() => setShowDetails(true)}
                          variant="ghost"
                          className="text-[#00d4ff] hover:text-[#38bdf8] hover:bg-[#00d4ff]/10"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Customize
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-[#6b7280]">
                        <a 
                          href={createPageUrl('Privacy')} 
                          className="hover:text-[#00d4ff] transition-colors"
                        >
                          Privacy Policy
                        </a>
                        <span>•</span>
                        <a 
                          href={createPageUrl('Terms')} 
                          className="hover:text-[#00d4ff] transition-colors"
                        >
                          Terms of Service
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Preferences Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <Card className="bg-[#0a0a0a] border-[#262626]">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Shield className="w-8 h-8 text-[#00d4ff]" />
                      <div>
                        <h2 className="text-2xl font-bold text-white">Privacy Preferences</h2>
                        <p className="text-[#a3a3a3]">Control how we collect and use your data</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowDetails(false)}
                      variant="ghost"
                      size="icon"
                      className="text-[#a3a3a3] hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-6 mb-8">
                    {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => (
                      <div
                        key={key}
                        className={`p-6 rounded-xl border transition-all ${
                          category.highlight 
                            ? 'border-[#00d4ff]/30 bg-[#00d4ff]/5' 
                            : 'border-[#262626] bg-[#111111]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              category.highlight 
                                ? 'bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]' 
                                : 'bg-[#262626]'
                            }`}>
                              <category.icon className={`w-6 h-6 ${
                                category.highlight ? 'text-[#0a0a0a]' : 'text-[#a3a3a3]'
                              }`} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                                {category.required && (
                                  <Badge variant="secondary" className="bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30">
                                    Required
                                  </Badge>
                                )}
                                {category.highlight && (
                                  <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">
                                    <Brain className="w-3 h-3 mr-1" />
                                    AI Demo
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[#a3a3a3] mb-3">{category.description}</p>
                              <div className="text-sm text-[#6b7280]">
                                <strong>Examples:</strong> {category.examples.join(', ')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 ml-4">
                            <Button
                              onClick={() => handleCategoryToggle(key)}
                              disabled={category.required}
                              variant={preferences[key] ? "default" : "outline"}
                              size="sm"
                              className={preferences[key] 
                                ? "bg-[#10b981] hover:bg-[#059669] text-white" 
                                : "border-[#404040] text-[#a3a3a3] hover:text-white"
                              }
                            >
                              {preferences[key] ? (
                                <><Check className="w-4 h-4 mr-2" />Enabled</>
                              ) : (
                                <><X className="w-4 h-4 mr-2" />Disabled</>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 items-center justify-between pt-6 border-t border-[#262626]">
                    <div className="text-sm text-[#6b7280]">
                      <Info className="w-4 h-4 inline mr-2" />
                      Your preferences are saved locally and expire after 30 days.
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowDetails(false)}
                        variant="outline"
                        className="border-[#404040] text-[#a3a3a3] hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSavePreferences}
                        className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-[#0a0a0a] font-bold"
                      >
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CookieConsentBanner;
