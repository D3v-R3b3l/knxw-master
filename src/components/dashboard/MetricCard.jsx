import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export default function MetricCard({ title, value, change, icon: Icon, color = "blue", delay = 0, href, aiContext, resizable }) {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <a href={href} className="block h-full group">
        <Card className="relative h-full bg-[#111]/50 backdrop-blur-md border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden group-hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] group-hover:-translate-y-1">
          {/* Background Gradient Glow */}
          <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${color}-500/10 rounded-full blur-3xl transition-opacity opacity-50 group-hover:opacity-80`} />
          
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{title}</CardTitle>
            <div className={`p-2 rounded-lg bg-white/5 border border-white/5 text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
              {Icon && <Icon className="h-4 w-4" />}
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white tracking-tight mb-2">{value}</div>
            
            <div className="flex items-center justify-between">
              {change !== undefined ? (
                <div className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="font-medium">{Math.abs(change)}%</span>
                </div>
              ) : (
                <div className="h-5" />
              )}
              
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </CardContent>
        </Card>
      </a>
    </motion.div>
  );
}