import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageSquare, X } from 'lucide-react';

export default function CheckInWidget({ checkInData, onDismiss }) {
  const [selectedResponse, setSelectedResponse] = useState(null);

  if (!checkInData) {
    return null;
  }

  const handleResponse = (response) => {
    setSelectedResponse(response);
    // In a real app, you would send this response back to your analytics
    console.log(`User responded to check-in with: "${response}"`);
    setTimeout(() => {
      onDismiss();
    }, 1500); // Hide after a delay
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="fixed bottom-6 right-6 w-full max-w-sm z-50"
      >
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#262626] rounded-2xl shadow-2xl shadow-black/50 text-white overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#fbbf24]/20 to-[#f59e0b]/20 border border-[#fbbf24]/30">
                  <Sparkles className="w-5 h-5 text-[#fbbf24]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{checkInData.title}</h3>
                  <p className="text-sm text-[#a3a3a3]">A quick question for you</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={onDismiss} className="text-[#a3a3a3] hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {selectedResponse ? (
                <div className="text-center p-4">
                  <p className="text-lg font-semibold text-[#10b981]">Thanks for your feedback!</p>
                </div>
              ) : (
                checkInData.questions.map((q, index) => (
                  <Button
                    key={index}
                    onClick={() => handleResponse(q)}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 border-[#262626] bg-[#1a1a1a] hover:bg-[#262626] hover:border-[#00d4ff]/50"
                  >
                    <MessageSquare className="w-4 h-4 mr-3 text-[#a3a3a3]" />
                    <span className="flex-1 whitespace-normal">{q}</span>
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}