import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tourSteps = [
  {
    id: 'hero',
    title: 'Welcome to knXw',
    description: 'The universal intelligence layer for understanding why users do what they do across any digital environment.',
    target: null, // Full screen intro
    position: 'center'
  },
  {
    id: 'navigation',
    title: 'Easy Navigation',
    description: 'Scroll down to explore our platform features, use cases, and pricing. Everything is designed to be intuitive and accessible.',
    target: 'hero',
    position: 'bottom',
    highlightScroll: true
  },
  {
    id: 'use-cases',
    title: 'Real-World Use Cases',
    description: 'Click on any use case card to see detailed case studies with metrics, challenges, solutions, and results from real customers.',
    target: 'use-cases',
    position: 'top',
    highlightElement: '.use-case-card'
  },
  {
    id: 'interactive-demo',
    title: 'Try It Live',
    description: 'Experience our AI-powered psychographic analysis firsthand with an interactive demo. No sign-up required!',
    target: 'demo-section',
    position: 'top'
  },
  {
    id: 'pricing',
    title: 'Transparent Pricing',
    description: 'Choose a plan that fits your needs. Start free with our Developer plan and scale as you grow.',
    target: 'pricing',
    position: 'top'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You can restart this tour anytime from the help menu. Ready to get started?',
    target: null,
    position: 'center'
  }
];

export default function OnboardingTour({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  
  const step = tourSteps[currentStep];
  
  useEffect(() => {
    if (!isOpen || !step.target) {
      setTargetRect(null);
      return;
    }
    
    const updateTargetRect = () => {
      const element = document.getElementById(step.target) || 
                      document.querySelector(`[data-tour-id="${step.target}"]`);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Auto-scroll to element
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [isOpen, step.target, currentStep]);
  
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSkip = () => {
    onClose();
  };
  
  const handleComplete = () => {
    onComplete();
    onClose();
  };
  
  if (!isOpen) return null;
  
  const isCentered = step.position === 'center';
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleSkip}
        />
        
        {/* Spotlight effect */}
        {targetRect && !isCentered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute pointer-events-none"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.8)',
              border: '2px solid #06b6d4',
              borderRadius: '12px',
              zIndex: 9998
            }}
          />
        )}
        
        {/* Tour Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`absolute bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-cyan-500/30 rounded-2xl shadow-2xl p-6 w-full max-w-md ${
            isCentered ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
          }`}
          style={
            !isCentered && targetRect
              ? {
                  top: step.position === 'bottom' ? targetRect.bottom + 20 : 'auto',
                  bottom: step.position === 'top' ? window.innerHeight - targetRect.top + 20 : 'auto',
                  left: Math.max(20, Math.min(targetRect.left, window.innerWidth - 420)),
                  zIndex: 9999
                }
              : { zIndex: 9999 }
          }
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 font-bold text-sm">
                {currentStep + 1}
              </div>
              <span className="text-xs text-gray-400">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
          <p className="text-gray-300 leading-relaxed mb-6">{step.description}</p>
          
          {/* Progress dots */}
          <div className="flex gap-2 mb-6">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full flex-1 transition-colors ${
                  idx === currentStep ? 'bg-cyan-500' : idx < currentStep ? 'bg-cyan-500/30' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="flex-1 border-white/10 hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            {currentStep === 0 && (
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1 border-white/10 hover:bg-white/5"
              >
                Skip Tour
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  Get Started
                  <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}