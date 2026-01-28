import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({ content, children, icon = 'info', position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  const Icon = icon === 'help' ? HelpCircle : Info;

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
  };

  return (
    <div className="relative inline-flex items-center group">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children || <Icon className="w-4 h-4 text-[#6b7280] hover:text-[#00d4ff] transition-colors" />}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]}`}
          >
            <div className="bg-[#0a0a0a] border border-[#00d4ff]/40 rounded-lg shadow-2xl p-3 max-w-xs">
              <p className="text-sm text-white leading-relaxed">{content}</p>
              <div className={`absolute w-2 h-2 bg-[#0a0a0a] border-[#00d4ff]/40 rotate-45 ${
                position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b' :
                position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t' :
                position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r' :
                'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l'
              }`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}