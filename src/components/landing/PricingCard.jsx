import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function PricingCard({ 
  plan, 
  price, 
  period = '/mo',
  description, 
  features = [], 
  isPopular = false,
  ctaText = 'Get Started',
  onCTAClick,
  gradient = 'from-[#111111] to-[#0a0a0a]',
  borderColor = 'border-[#262626]',
  badgeColor = 'bg-[#10b981] text-[#0a0a0a]'
}) {
  return (
    <motion.div
      className={`bg-gradient-to-br ${gradient} border ${borderColor} rounded-2xl p-6 hover:border-[#00d4ff]/30 transition-all duration-300 relative overflow-hidden ${isPopular ? 'scale-105' : ''}`}
      whileHover={{ scale: isPopular ? 1.05 : 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}>
      
      {isPopular && (
        <div className={`absolute top-0 right-0 ${badgeColor} px-3 py-1 text-xs font-bold rounded-bl-lg`}>
          MOST POPULAR
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{plan}</h3>
        <div className="text-3xl font-extrabold text-white mb-2">
          {price}
          {period && <span className="text-lg font-normal text-[#a3a3a3]">{period}</span>}
        </div>
        <p className="text-[#a3a3a3] text-sm">{description}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-[#a3a3a3]">
            <div className={`w-4 h-4 rounded-full ${isPopular ? 'bg-[#10b981]' : 'bg-[#00d4ff]'} flex-shrink-0 flex items-center justify-center`}>
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onCTAClick}
        className={`w-full ${isPopular ? 'bg-[#10b981] text-white hover:bg-[#059669]' : 'bg-[#262626] text-white hover:bg-[#404040]'} border-0 font-bold`}>
        {ctaText}
      </Button>
    </motion.div>
  );
}