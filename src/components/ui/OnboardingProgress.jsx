import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Circle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ONBOARDING_CHECKLIST = [
  { id: 'create_app', label: 'Create your first application', page: 'MyApps' },
  { id: 'view_dashboard', label: 'Explore the dashboard', page: 'Dashboard' },
  { id: 'view_profiles', label: 'View user profiles', page: 'Profiles' },
  { id: 'view_events', label: 'Check event stream', page: 'Events' },
  { id: 'create_segment', label: 'Build an audience segment', page: 'AudienceBuilder' },
  { id: 'view_insights', label: 'Review AI insights', page: 'Insights' },
  { id: 'complete_tour', label: 'Complete the guided tour', page: 'Dashboard' }
];

export default function OnboardingProgress() {
  const [progress, setProgress] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const user = await base44.auth.me();
        setProgress(user.onboarding_state || {});
        if (user.onboarding_state?.progress_bar_dismissed) {
          setIsDismissed(true);
        }
      } catch (error) {
        console.error('Failed to load onboarding progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  const handleDismiss = async () => {
    setIsDismissed(true);
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        onboarding_state: {
          ...user.onboarding_state,
          progress_bar_dismissed: true
        }
      });
    } catch (e) {}
  };

  const completedCount = ONBOARDING_CHECKLIST.filter(item => progress[item.id]).length;
  const totalCount = ONBOARDING_CHECKLIST.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  if (isLoading || isDismissed) return null;

  // Hide if 100% complete
  if (percentage === 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-6 z-40 w-80"
    >
      <div className="bg-[#111111] border border-[#262626] rounded-xl shadow-2xl overflow-hidden">
        <div
          className="p-4 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold flex items-center gap-2">
              Getting Started
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#00d4ff] font-bold">{percentage}%</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
                className="p-1 rounded hover:bg-white/10 text-[#6b7280] hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9]"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-[#262626]"
            >
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {ONBOARDING_CHECKLIST.map((item) => {
                  const isCompleted = progress[item.id];
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        isCompleted ? 'bg-[#10b981]/10' : 'hover:bg-[#1a1a1a]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-[#10b981] flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#6b7280] flex-shrink-0" />
                      )}
                      <span className={`text-sm flex-1 ${isCompleted ? 'text-[#10b981] line-through' : 'text-[#a3a3a3]'}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}