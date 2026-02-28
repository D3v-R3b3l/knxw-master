import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const GLOW_COLORS = {
  blue: "group-hover:shadow-[0_0_40px_rgba(0,212,255,0.25)] group-hover:border-[#00d4ff]/50",
  cyan: "group-hover:shadow-[0_0_40px_rgba(0,212,255,0.25)] group-hover:border-[#00d4ff]/50",
  green: "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] group-hover:border-[#10b981]/50",
  emerald: "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] group-hover:border-[#10b981]/50",
  yellow: "group-hover:shadow-[0_0_40px_rgba(251,191,36,0.25)] group-hover:border-[#fbbf24]/50",
  purple: "group-hover:shadow-[0_0_40px_rgba(139,92,246,0.25)] group-hover:border-[#8b5cf6]/50",
  pink: "group-hover:shadow-[0_0_40px_rgba(236,72,153,0.25)] group-hover:border-[#ec4899]/50",
};

export default function MetricCard({ title, value, change, icon: Icon, gradient = "from-[#00d4ff] to-[#0ea5e9]", delay = 0, href, aiContext, resizable }) {
  const isPositive = change >= 0;
  
  // Extract color from gradient for glow
  const glowColor = gradient.includes("00d4ff") ? "cyan" 
    : gradient.includes("10b981") ? "green"
    : gradient.includes("fbbf24") ? "yellow"
    : gradient.includes("8b5cf6") ? "purple"
    : gradient.includes("ec4899") ? "pink"
    : "cyan";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <Link to={href} className="block h-full group">
        <Card className={`relative h-full bg-[#111111] border-[#262626] transition-all duration-300 overflow-hidden group-hover:-translate-y-1 ${GLOW_COLORS[glowColor] || GLOW_COLORS.cyan}`}>
          {/* Animated gradient border on hover */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradient} opacity-20 blur-xl`} />
          </div>
          
          {/* Glow orb that follows hover */}
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-all duration-500 opacity-0 group-hover:opacity-60 bg-gradient-to-r ${gradient}`} />
          
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-[#a3a3a3] group-hover:text-white transition-colors duration-300">{title}</CardTitle>
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
              {Icon && <Icon className="h-4 w-4 text-[#0a0a0a]" />}
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white tracking-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 transition-all duration-300">{value}</div>
            
            <div className="flex items-center justify-between">
              {change !== undefined ? (
                <div className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="font-medium">{Math.abs(change)}%</span>
                </div>
              ) : (
                <div className="h-5" />
              )}
              
              <ArrowRight className="w-4 h-4 text-[#6b7280] group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}