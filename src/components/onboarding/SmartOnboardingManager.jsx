
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, X, MessageSquare } from 'lucide-react';
import AIChatModal from './AIChatModal';

export default function SmartOnboardingManager({ onClose, navigate, currentPageName }) {
  const [showChat, setShowChat] = useState(false);
  const [chatInstance, setChatInstance] = useState(0);

  // Function to handle completion of onboarding, reusable
  const completeOnboarding = () => {
    try {
      localStorage.setItem('knxw_onboarding_seen', '1');
    } catch (e) {
      console.warn('Could not save onboarding state', e);
    }
    onClose();
  };

  // Function to load onboarding state and close if already seen
  const loadOnboardingState = () => {
    try {
      const onboardingSeen = localStorage.getItem('knxw_onboarding_seen');
      if (onboardingSeen === '1') {
        onClose(); // If seen, close the onboarding manager
      }
    } catch (e) {
      console.warn('Could not load onboarding state', e);
    }
  };

  useEffect(() => {
    loadOnboardingState();
  }, []);

  // MEMORY LEAK FIX: Cleanup custom event listener
  useEffect(() => {
    const handleCompleteTour = () => {
      completeOnboarding();
    };

    window.addEventListener('completeOnboardingTour', handleCompleteTour);
    
    return () => {
      window.removeEventListener('completeOnboardingTour', handleCompleteTour);
    };
  }, []);

  const handleOpenChat = () => {
    setShowChat(true);
    setChatInstance(prev => prev + 1);
  };

  const handleCloseChat = () => {
    setShowChat(false);
  };

  const handleCompleteOnboarding = () => {
    completeOnboarding(); // Use the new common function
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] bg-[#111111] border-[#262626] text-white">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                <Brain className="w-6 h-6 text-[#0a0a0a]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Welcome to knXw!</h2>
                <p className="text-[#a3a3a3] text-sm">Your psychographic analytics platform</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-[#a3a3a3]">
              I'm your AI assistant, here to help you navigate and understand knXw's powerful psychographic analytics features.
            </p>
            
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">How can I help you?</h3>
              <ul className="text-sm text-[#a3a3a3] space-y-1">
                <li>• Explain any feature or metric you see</li>
                <li>• Guide you through setting up your first app</li>
                <li>• Help you understand user insights</li>
                <li>• Answer questions about psychographic data</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleOpenChat}
              className="flex-1 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat with AI Assistant
            </Button>
            <Button
              variant="outline"
              onClick={handleCompleteOnboarding}
              className="border-[#262626] text-white hover:bg-[#1a1a1a]"
            >
              Skip for now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AIChatModal
        open={showChat}
        onClose={handleCloseChat}
        context={{
          aiContext: "New user onboarding - help them understand knXw's psychographic analytics platform",
          page: currentPageName
        }}
        instance={chatInstance}
      />
    </>
  );
}
