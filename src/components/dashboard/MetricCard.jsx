import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricCard({ title, value, change, icon: Icon, color = "blue", delay = 0 }) {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="bg-[#1a1a1a] border-[#262626] hover:border-[#00d4ff]/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#a3a3a3]">{title}</CardTitle>
          {Icon && <Icon className={`h-4 w-4 text-${color}-400`} />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{value}</div>
          {change !== undefined && (
            <p className={`text-xs flex items-center gap-1 mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(change)}% from last period
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}