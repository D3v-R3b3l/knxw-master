import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { analyzeMarketTrends } from "@/functions/analyzeMarketTrends";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Loader2, TrendingUp, Target, Shield, Zap, 
  FileText, ArrowRight, BarChart3, Globe, AlertTriangle,
  CheckCircle2, BookOpen, Share2, Download, Clock,
  Brain, Lightbulb
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SubscriptionGate } from '@/components/billing/SubscriptionGate';
import { callWithRetry } from "@/components/system/apiRetry";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedDonut from "@/components/charts/AnimatedDonut";

// --- Components ---

const InsightCard = ({ title, children, icon: Icon, color = "blue", className = "" }) => (
  <Card className={`bg-[#111111] border-[#262626] h-full ${className}`}>
    <CardHeader className="pb-3">
      <CardTitle className="text-white flex items-center gap-2 text-lg">
        {Icon && <Icon className={`w-5 h-5 text-${color}-500`} />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const ResearchHistorySidebar = ({ analyses, onSelect, selectedId, onDelete }) => (
  <div className="w-full lg:w-72 bg-[#0f0f0f] border-r border-[#262626] flex flex-col h-full lg:h-auto lg:min-h-[calc(100vh-4rem)]">
    <div className="p-4 border-b border-[#262626]">
      <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider">Recent Research</h3>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
      {analyses.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className={`w-full text-left p-3 rounded-lg transition-all ${
            selectedId === item.id 
              ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/30' 
              : 'hover:bg-[#1a1a1a] border border-transparent'
          }`}
        >
          <div className="font-medium text-white truncate text-sm">{item.title}</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-[#666]">
              {formatDistanceToNow(new Date(item.analyzed_at), { addSuffix: true })}
            </span>
            {selectedId === item.id && <div className="w-2 h-2 rounded-full bg-[#00d4ff]" />}
          </div>
        </button>
      ))}
      {analyses.length === 0 && (
        <div className="text-center py-8 text-[#666] text-sm">
          No research history found.
        </div>
      )}
    </div>
  </div>
);

const DeepResearchReport = ({ data }) => {
  if (!data || !data.psychographic_analysis) return null;
  
  const report = data.psychographic_analysis;
  const { executive_summary, market_dynamics, competitive_landscape, swot_analysis, consumer_insights, strategic_recommendations } = report;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#262626] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{data.title}</h1>
            <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">Deep Research</Badge>
          </div>
          <p className="text-[#a3a3a3] max-w-2xl">
            Generated on {new Date(data.analyzed_at).toLocaleDateString()} • Industry: {data.industry_category}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-[#262626] text-[#a3a3a3] hover:text-white">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button variant="outline" size="sm" className="border-[#262626] text-[#a3a3a3] hover:text-white">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Executive Summary & Key Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InsightCard title="Executive Brief" icon={FileText} color="purple">
            <p className="text-[#e5e5e5] leading-relaxed text-lg font-light whitespace-pre-line">
              {executive_summary}
            </p>
          </InsightCard>
        </div>
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-[#111] to-[#1a1a1a] border-[#262626]">
            <CardContent className="p-6">
              <h4 className="text-[#a3a3a3] text-sm font-medium mb-1">Market Size</h4>
              <div className="text-3xl font-bold text-white mb-4">{market_dynamics?.market_size || "N/A"}</div>
              
              <h4 className="text-[#a3a3a3] text-sm font-medium mb-1">Growth Rate</h4>
              <div className="text-3xl font-bold text-[#10b981] mb-4">{market_dynamics?.growth_rate || "N/A"}</div>
              
              <h4 className="text-[#a3a3a3] text-sm font-medium mb-1">Outlook</h4>
              <Badge className={`
                ${market_dynamics?.outlook === 'Positive' ? 'bg-green-500/20 text-green-400' : 
                  market_dynamics?.outlook === 'Negative' ? 'bg-red-500/20 text-red-400' : 
                  'bg-yellow-500/20 text-yellow-400'}
              `}>
                {market_dynamics?.outlook || "Neutral"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="landscape" className="w-full">
        <TabsList className="bg-[#1a1a1a] border border-[#262626] p-1 mb-6">
          <TabsTrigger value="landscape" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
            Market Landscape
          </TabsTrigger>
          <TabsTrigger value="swot" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
            SWOT Analysis
          </TabsTrigger>
          <TabsTrigger value="consumer" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
            Consumer Psychology
          </TabsTrigger>
          <TabsTrigger value="strategy" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
            Strategic Actions
          </TabsTrigger>
        </TabsList>

        {/* Market Landscape Tab */}
        <TabsContent value="landscape" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <InsightCard title="Key Trends" icon={TrendingUp} color="blue">
              <div className="space-y-4">
                {market_dynamics?.key_trends?.map((trend, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      trend.impact_level === 'Critical' ? 'bg-red-500' : 
                      trend.impact_level === 'High' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{trend.trend}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#333] text-[#999] uppercase">{trend.impact_level}</span>
                      </div>
                      <p className="text-sm text-[#9ca3af]">{trend.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </InsightCard>

            <InsightCard title="Competitive Landscape" icon={Target} color="red">
              <div className="space-y-4">
                {competitive_landscape?.map((comp, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-bold">{comp.name}</h4>
                      <Badge variant="outline" className="border-[#333] text-[#999]">{comp.market_share_est} Share</Badge>
                    </div>
                    <p className="text-sm text-[#9ca3af] mb-2"><span className="text-[#666]">Strategy:</span> {comp.strategy}</p>
                    <p className="text-sm text-[#9ca3af]"><span className="text-[#666]">Strength:</span> {comp.strengths}</p>
                  </div>
                ))}
              </div>
            </InsightCard>
          </div>
        </TabsContent>

        {/* SWOT Tab */}
        <TabsContent value="swot">
          <div className="grid md:grid-cols-2 gap-4">
            <InsightCard title="Strengths" icon={CheckCircle2} color="green" className="border-t-4 border-t-green-500">
              <ul className="space-y-2">
                {swot_analysis?.strengths?.map((item, i) => (
                  <li key={i} className="flex gap-2 text-[#e5e5e5]">
                    <span className="text-green-500">•</span> {item}
                  </li>
                ))}
              </ul>
            </InsightCard>
            <InsightCard title="Weaknesses" icon={AlertTriangle} color="orange" className="border-t-4 border-t-orange-500">
              <ul className="space-y-2">
                {swot_analysis?.weaknesses?.map((item, i) => (
                  <li key={i} className="flex gap-2 text-[#e5e5e5]">
                    <span className="text-orange-500">•</span> {item}
                  </li>
                ))}
              </ul>
            </InsightCard>
            <InsightCard title="Opportunities" icon={Zap} color="blue" className="border-t-4 border-t-blue-500">
              <ul className="space-y-2">
                {swot_analysis?.opportunities?.map((item, i) => (
                  <li key={i} className="flex gap-2 text-[#e5e5e5]">
                    <span className="text-blue-500">•</span> {item}
                  </li>
                ))}
              </ul>
            </InsightCard>
            <InsightCard title="Threats" icon={Shield} color="red" className="border-t-4 border-t-red-500">
              <ul className="space-y-2">
                {swot_analysis?.threats?.map((item, i) => (
                  <li key={i} className="flex gap-2 text-[#e5e5e5]">
                    <span className="text-red-500">•</span> {item}
                  </li>
                ))}
              </ul>
            </InsightCard>
          </div>
        </TabsContent>

        {/* Consumer Psychology Tab */}
        <TabsContent value="consumer" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InsightCard title="Psychographic Profile" icon={Brain} color="purple">
                <p className="text-[#e5e5e5] mb-6 text-lg font-light italic border-l-4 border-[#8b5cf6] pl-4">
                  "{consumer_insights?.psychographic_profile}"
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-[#a3a3a3] text-sm font-bold uppercase mb-3">Primary Motivations</h4>
                    <div className="flex flex-wrap gap-2">
                      {consumer_insights?.primary_motivations?.map((m, i) => (
                        <Badge key={i} className="bg-[#8b5cf6]/20 text-[#a78bfa] hover:bg-[#8b5cf6]/30">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[#a3a3a3] text-sm font-bold uppercase mb-3">Emotional Triggers</h4>
                    <div className="flex flex-wrap gap-2">
                      {consumer_insights?.emotional_triggers?.map((t, i) => (
                        <Badge key={i} className="bg-[#ec4899]/20 text-[#f472b6] hover:bg-[#ec4899]/30">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </InsightCard>
            </div>
            
            <div className="space-y-6">
              <InsightCard title="Pain Points" icon={AlertTriangle} color="red">
                <ul className="space-y-3">
                  {consumer_insights?.pain_points?.map((point, i) => (
                    <li key={i} className="text-sm text-[#e5e5e5] bg-[#1a1a1a] p-2 rounded border border-[#333]">
                      {point}
                    </li>
                  ))}
                </ul>
              </InsightCard>
              
              <InsightCard title="Unmet Needs" icon={Target} color="green">
                <ul className="space-y-3">
                  {consumer_insights?.unmet_needs?.map((need, i) => (
                    <li key={i} className="text-sm text-[#e5e5e5] bg-[#1a1a1a] p-2 rounded border border-[#333]">
                      {need}
                    </li>
                  ))}
                </ul>
              </InsightCard>
            </div>
          </div>
        </TabsContent>

        {/* Strategic Actions Tab */}
        <TabsContent value="strategy">
          <div className="space-y-4">
            {strategic_recommendations?.map((rec, i) => (
              <div 
                key={i}
                className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#111] border border-[#262626] hover:border-[#00d4ff]/30 transition-all"
              >
                <div className={`mt-1 p-3 rounded-full ${
                  rec.priority === 'Immediate' ? 'bg-red-500/20 text-red-400' :
                  rec.priority === 'Short-term' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {rec.priority === 'Immediate' ? <Zap className="w-6 h-6" /> : <Lightbulb className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{rec.title}</h3>
                    <Badge variant="outline" className={`
                      ${rec.priority === 'Immediate' ? 'border-red-500 text-red-400' :
                        rec.priority === 'Short-term' ? 'border-orange-500 text-orange-400' :
                        'border-blue-500 text-blue-400'}
                    `}>
                      {rec.priority} Priority
                    </Badge>
                  </div>
                  <p className="text-[#a3a3a3] text-lg leading-relaxed">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// --- Main Page Component ---

export default function MarketIntelligencePage() {
  const [topic, setTopic] = useState("");
  const [industry, setIndustry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Load history
  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    setIsLoadingHistory(true);
    try {
      // Using the same entity 'MarketTrend' as before for compatibility
      const data = await base44.entities.MarketTrend.list('-analyzed_at', 50);
      setAnalyses(data);
      if (data.length > 0 && !selectedAnalysis) {
        setSelectedAnalysis(data[0]);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAnalyze = async () => {
    if (!topic.trim()) return;
    
    setIsAnalyzing(true);
    setSelectedAnalysis(null);
    
    try {
      const result = await callWithRetry(() => analyzeMarketTrends({ 
        topic, 
        industry_category: industry 
      }));
      
      // The backend now returns the full data in the 'data' field of the response, 
      // or we can re-fetch. The function returns { success, analysis_id, data }.
      // Let's reload to be safe and consistent.
      await loadAnalyses();
      
      // Find the new analysis and select it
      const newAnalysis = await base44.entities.MarketTrend.get(result.analysis_id);
      setSelectedAnalysis(newAnalysis);
      setTopic("");
      setIndustry("");
      
    } catch (error) {
      console.error("Analysis failed:", error);
      // toast error here
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SubscriptionGate requiredPlan="pro" feature="Deep Market Intelligence">
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col lg:flex-row">
        
        {/* Sidebar */}
        <ResearchHistorySidebar 
          analyses={analyses} 
          selectedId={selectedAnalysis?.id} 
          onSelect={setSelectedAnalysis}
        />

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto h-screen bg-[#000]">
          
          {/* Search Area */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0055ff] mb-6 shadow-[0_0_30px_rgba(0,212,255,0.3)]">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Market Intelligence Engine
              </h1>
              <p className="text-[#a3a3a3] text-lg max-w-2xl mx-auto">
                Perform deep, AI-powered research on competitors, market trends, and consumer behavior. 
                Access real-time data and strategic insights instantly.
              </p>
            </div>

            <div className="bg-[#111] border border-[#262626] p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666]" />
                <Input 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Research a company, trend, or market..."
                  className="w-full pl-12 bg-transparent border-none h-12 text-lg focus:ring-0 focus:ring-offset-0"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <div className="md:w-48 border-t md:border-t-0 md:border-l border-[#262626]">
                <Input 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Industry (Optional)"
                  className="w-full bg-transparent border-none h-12 text-center text-[#999] focus:ring-0 focus:ring-offset-0"
                />
              </div>
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !topic.trim()}
                className="h-12 px-8 bg-[#00d4ff] hover:bg-[#00b3cc] text-black font-bold text-lg rounded-xl shadow-lg shadow-[#00d4ff]/20"
              >
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deep Research"}
              </Button>
            </div>
          </div>

          {/* Results Area */}
          <div className="max-w-7xl mx-auto">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-t-4 border-r-4 border-[#00d4ff] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-[#00d4ff] animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white">Gathering Intelligence...</h3>
                  <p className="text-[#a3a3a3]">Scanning market data, analyzing competitors, and synthesizing insights.</p>
                </div>
              </div>
            ) : selectedAnalysis ? (
              <DeepResearchReport data={selectedAnalysis} />
            ) : (
              <div className="text-center py-20 border-t border-[#262626]">
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="p-6 rounded-2xl bg-[#111] border border-[#262626]">
                    <Target className="w-8 h-8 text-red-500 mb-4 mx-auto" />
                    <h3 className="text-white font-bold mb-2">Competitive Recon</h3>
                    <p className="text-[#666] text-sm">Uncover competitor strategies, SWOT analysis, and market positioning gaps.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#111] border border-[#262626]">
                    <TrendingUp className="w-8 h-8 text-green-500 mb-4 mx-auto" />
                    <h3 className="text-white font-bold mb-2">Trend Forecasting</h3>
                    <p className="text-[#666] text-sm">Identify emerging market trends, growth rates, and future opportunities.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#111] border border-[#262626]">
                    <Brain className="w-8 h-8 text-purple-500 mb-4 mx-auto" />
                    <h3 className="text-white font-bold mb-2">Consumer Psychology</h3>
                    <p className="text-[#666] text-sm">Decode customer motivations, emotional triggers, and buying behaviors.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </SubscriptionGate>
  );
}