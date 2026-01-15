import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Gamepad2, TrendingUp, Code, FileText, Bot, AlertTriangle, Sliders, Cpu, Route, UserCheck, RefreshCcw, BarChart3, Store, Users } from 'lucide-react';

export default function PlatformFeatures() {
  return (
    <section id="platform" className="py-24 md:py-32 bg-[#050505] text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.04),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
           <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
              Platform
           </span>
           <h2 className="text-4xl md:text-6xl font-bold mb-6">Complete Intelligence Platform</h2>
           <p className="text-xl text-gray-400 max-w-2xl mx-auto">From tracking to activation, everything you need for psychographic intelligence</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-auto">
          {/* Large Card - Psychographic Profiling */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-8 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 md:p-10 border border-white/5 hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden group"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-600/10 flex items-center justify-center mb-6 border border-blue-500/20">
                 <Brain className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Psychographic Profiling</h3>
              <p className="text-gray-400 text-lg max-w-lg leading-relaxed">Automatically generate psychological profiles revealing motivations, cognitive styles, and personality traits.</p>
              <span className="inline-block mt-6 text-xs font-mono bg-white/5 px-4 py-2 rounded-full text-gray-400 border border-white/10">ALL PLANS</span>
            </div>
          </motion.div>

          {/* Medium Card - GameDev */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-purple-600/10 flex items-center justify-center mb-5 border border-purple-500/20">
                 <Gamepad2 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">GameDev Intelligence</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Player motivation, adaptive difficulty, and churn prediction for games.</p>
              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">GROWTH+</span>
            </div>
          </motion.div>

          {/* Medium Card - Market Intelligence */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600/30 to-emerald-600/10 flex items-center justify-center mb-5 border border-emerald-500/20">
                 <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Market Intelligence</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Analyze competitors and trends through a psychographic lens.</p>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">PRO</span>
            </div>
          </motion.div>

          {/* Large Card - Developer Platform */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-8 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 md:p-10 border border-white/5 hover:border-orange-500/30 transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600/30 to-orange-600/10 flex items-center justify-center mb-6 border border-orange-500/20">
                 <Code className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Developer Platform</h3>
              <p className="text-gray-400 text-lg max-w-lg leading-relaxed">RESTful APIs, SDKs, webhooks, and playground for rapid integration.</p>
              <span className="inline-block mt-6 text-xs font-mono bg-white/5 px-4 py-2 rounded-full text-gray-400 border border-white/10">FREE TIER</span>
            </div>
          </motion.div>
          
          {/* Other features - Enhanced */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="md:col-span-6 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Content Engine</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Auto-recommend content based on unique psychological profiles.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-6 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-pink-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0 border border-pink-500/20">
                <Bot className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">AI Automation</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Deploy intelligent agents for personalized engagements.</p>
              </div>
            </div>
          </motion.div>

          {/* New Advanced Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-yellow-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0 border border-yellow-500/20">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Cognitive Bias Detection</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Identify anchoring, confirmation, and loss aversion biases.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-rose-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                <TrendingUp className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Emotional Shift Tracking</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Monitor subtle emotional changes with volatility analysis.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                <Brain className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Custom Dimensions</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Define industry-specific psychographic traits and metrics.</p>
              </div>
            </div>
          </motion.div>

          {/* New Advanced AI Features Row */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-violet-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                <Cpu className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">AI Inference Studio</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Fine-tune psychographic models with custom weights and confidence thresholds.</p>
                <span className="inline-block mt-3 text-xs font-mono text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">GROWTH+</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-fuchsia-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center flex-shrink-0 border border-fuchsia-500/20">
                <Route className="w-5 h-5 text-fuchsia-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">AI Journey Orchestrator</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Proactive AI suggestions for journey optimization based on behavioral patterns.</p>
                <span className="inline-block mt-3 text-xs font-mono text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-500/20">PRO</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-teal-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
                <UserCheck className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">User Data Portal</h3>
                <p className="text-gray-400 text-sm leading-relaxed">End-user transparency and control over their psychographic data.</p>
                <span className="inline-block mt-3 text-xs font-mono text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">ALL PLANS</span>
              </div>
            </div>
          </motion.div>

          {/* Self-Learning AI Feature - Full Width */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.65 }}
            className="md:col-span-12 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 md:p-10 border border-white/5 hover:border-amber-500/30 transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-600/30 to-amber-600/10 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                <RefreshCcw className="w-8 h-8 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Self-Learning AI Feedback Loop</h3>
                <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
                  Engagement outcomes continuously train and improve psychographic predictions. Every user interaction makes the AI smarter—automatically adjusting confidence thresholds and refining inference models based on real-world performance.
                </p>
              </div>
              <span className="inline-block text-xs font-mono bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-6 py-3 rounded-full text-amber-300 border border-amber-500/30 whitespace-nowrap">🧠 AUTONOMOUS OPTIMIZATION</span>
            </div>
          </motion.div>

          {/* Integrations Ecosystem - New Full Width */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="md:col-span-12 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 md:p-10 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-600/30 to-cyan-600/10 flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                  <Code className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">Enterprise Integration Ecosystem</h3>
                  <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
                    Connect psychographic intelligence to your entire tech stack. Native SDKs for JavaScript, Python, Go, Ruby, and PHP with seamless integrations across CRM, e-commerce, BI, and communication platforms.
                  </p>
                </div>
              </div>

              {/* Animated Logo Marquee */}
              <div className="relative mb-8 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />
                
                <div className="flex gap-8 animate-logo-marquee">
                  {[...Array(2)].map((_, setIndex) => (
                    <div key={setIndex} className="flex gap-8 items-center">
                      {/* CRM */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/hubspot/hubspot-icon.svg" alt="HubSpot" className="w-6 h-6" />
                        <span className="text-sm text-gray-400">HubSpot</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/salesforce/salesforce-icon.svg" alt="Salesforce" className="w-6 h-6" />
                        <span className="text-sm text-gray-400">Salesforce</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/zoho/zoho-icon.svg" alt="Zoho" className="w-6 h-6" />
                        <span className="text-sm text-gray-400">Zoho</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/pipedrive/pipedrive-icon.svg" alt="Pipedrive" className="w-6 h-6" />
                        <span className="text-sm text-gray-400">Pipedrive</span>
                      </div>
                      {/* E-commerce */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/shopify/shopify-icon.svg" alt="Shopify" className="w-6 h-6" />
                        <span className="text-sm text-gray-400">Shopify</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/magaboraboraro/magaboraboraro-icon.svg" alt="Magento" className="w-6 h-6" onError={(e) => { e.target.style.display = 'none'; }} />
                        <span className="text-sm text-gray-400">Magento</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/woocommerce/woocommerce-icon.svg" alt="WooCommerce" className="w-6 h-6" />
                        <span className="text-sm text-gray-400">WooCommerce</span>
                      </div>
                      {/* BI Tools */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/tableau/tableau-icon.svg" alt="Tableau" className="w-6 h-6" />
                        <span className="text-sm text-gray-400">Tableau</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/microsoft_powerbi/microsoft_powerbi-icon.svg" alt="Power BI" className="w-6 h-6" />
                        <span className="text-sm text-gray-400">Power BI</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/looaborativelooker/looaborativelooker-icon.svg" alt="Looker" className="w-6 h-6" onError={(e) => { e.target.style.display = 'none'; }} />
                        <span className="text-sm text-gray-400">Looker</span>
                      </div>
                      {/* Communication */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/twilio/twilio-icon.svg" alt="Twilio" className="w-6 h-6" />
                        <span className="text-sm text-gray-400">Twilio</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <img src="https://www.vectorlogo.zone/logos/slack/slack-icon.svg" alt="Slack" className="w-6 h-6" />
                        <span className="text-sm text-gray-400">Slack</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 whitespace-nowrap">
                        <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        <span className="text-sm text-gray-400">Email</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <Users className="w-6 h-6 text-red-400 mb-2" />
                  <h4 className="font-semibold text-white text-sm mb-1">CRM Platforms</h4>
                  <p className="text-xs text-gray-500">HubSpot, Salesforce, Zoho, Pipedrive</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <Store className="w-6 h-6 text-green-400 mb-2" />
                  <h4 className="font-semibold text-white text-sm mb-1">E-commerce</h4>
                  <p className="text-xs text-gray-500">Shopify, Magento, WooCommerce</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <BarChart3 className="w-6 h-6 text-purple-400 mb-2" />
                  <h4 className="font-semibold text-white text-sm mb-1">BI Tools</h4>
                  <p className="text-xs text-gray-500">Tableau, Power BI, Looker</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <Bot className="w-6 h-6 text-blue-400 mb-2" />
                  <h4 className="font-semibold text-white text-sm mb-1">Communication</h4>
                  <p className="text-xs text-gray-500">Twilio, Slack, Email</p>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes logo-marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-logo-marquee {
                animation: logo-marquee 30s linear infinite;
              }
              .animate-logo-marquee:hover {
                animation-play-state: paused;
              }
            `}</style>
          </motion.div>
        </div>
      </div>
    </section>
  );
}