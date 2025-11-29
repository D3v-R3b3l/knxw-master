import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap, AlertCircle, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarketShiftsTimeline({ shifts = [] }) {
  const getImpactColor = (impact) => {
    if (impact >= 0.7) return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30';
    if (impact >= 0.4) return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30';
    return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sentiment_shift': return <TrendingUp className="w-5 h-5 text-[#00d4ff]" />;
      case 'market_disruption': return <Zap className="w-5 h-5 text-[#fbbf24]" />;
      case 'competitive_move': return <Target className="w-5 h-5 text-[#ec4899]" />;
      case 'regulatory_change': return <AlertCircle className="w-5 h-5 text-[#ef4444]" />;
      default: return <TrendingUp className="w-5 h-5 text-[#00d4ff]" />;
    }
  };

  if (!shifts || shifts.length === 0) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-8 text-center">
          <p className="text-[#a3a3a3]">No significant market shifts detected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Market Shifts Timeline</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00d4ff] via-[#fbbf24] to-[#ec4899]" />
        
        {/* Timeline events */}
        <div className="space-y-6">
          {shifts.map((shift, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-16"
            >
              {/* Timeline dot */}
              <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-[#00d4ff] border-4 border-[#0a0a0a] z-10" />
              
              <Card className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(shift.type)}
                      <div>
                        <h4 className="text-white font-semibold">{shift.title}</h4>
                        <p className="text-sm text-[#a3a3a3]">{shift.date}</p>
                      </div>
                    </div>
                    <Badge className={getImpactColor(shift.impact)}>
                      Impact: {(shift.impact * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-[#a3a3a3] mb-3 leading-relaxed">
                    {shift.description}
                  </p>
                  
                  {/* Sentiment indicator */}
                  {shift.sentiment_change && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#6b7280]">Sentiment:</span>
                      {shift.sentiment_change > 0 ? (
                        <div className="flex items-center gap-1 text-[#10b981]">
                          <TrendingUp className="w-4 h-4" />
                          <span>+{(shift.sentiment_change * 100).toFixed(1)}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[#ef4444]">
                          <TrendingDown className="w-4 h-4" />
                          <span>{(shift.sentiment_change * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Affected entities */}
                  {shift.affected_companies && shift.affected_companies.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {shift.affected_companies.map((company, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {company}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}