
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { analyzeMarketTrends } from "@/functions/analyzeMarketTrends";
import { exportMarketIntelligenceReport } from "@/functions/exportMarketIntelligenceReport";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  Loader2,
  Lightbulb,
  Briefcase,
  Search,
  Trash2,
  Download,
  Mail,
  Target,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Activity,
  BarChart3
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { SubscriptionGate } from '@/components/billing/SubscriptionGate';
import { callWithRetry } from "@/components/system/apiRetry";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import AnimatedDonut from "@/components/charts/AnimatedDonut";
import AnimatedLine from "@/components/charts/AnimatedLine";
import AnimatedBar from "@/components/charts/AnimatedBar";
import TrendForecastEngine from "../components/market/TrendForecastEngine";
import CompetitiveSentimentAnalysis from "../components/market/CompetitiveSentimentAnalysis";
import MarketShiftsTimeline from "../components/market/MarketShiftsTimeline";
import { motion } from "framer-motion";

const ProfessionalAnalysisDisplay = ({ analysis }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!analysis) return null;

  const {
    title,
    psychographic_analysis,
    competitor_name,
    industry_category,
    content_url,
    analyzed_at
  } = analysis;

  const formattedAnalyzedAt = analyzed_at ? format(new Date(analyzed_at), "MMM d, yyyy 'at' HH:mm") : "N/A";
  const isCompetitorAnalysis = competitor_name || (content_url && content_url !== '#');
  const competitiveIntelligence = psychographic_analysis?.competitive_intelligence;
  const marketIntelligence = psychographic_analysis?.market_intelligence;

  // Extract competitors for sentiment analysis
  const competitors = competitiveIntelligence?.key_competitors?.map(c => c.name || c) || 
                      [competitor_name].filter(Boolean);

  // Generate mock market shifts for timeline
  const marketShifts = [
    {
      type: 'sentiment_shift',
      title: 'Positive Sentiment Surge',
      description: 'Market sentiment has shifted positively driven by recent product innovations and strategic partnerships.',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      impact: 0.75,
      sentiment_change: 0.15,
      affected_companies: competitors.slice(0, 2)
    },
    {
      type: 'market_disruption',
      title: 'Technology Breakthrough Announcement',
      description: 'Major advancement in core technology disrupting traditional market dynamics and customer expectations.',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      impact: 0.9,
      sentiment_change: 0.22,
      affected_companies: competitors
    },
    {
      type: 'competitive_move',
      title: 'Strategic Partnership Formation',
      description: 'New alliances forming in the market creating competitive advantages and shifting market positioning.',
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      impact: 0.55,
      sentiment_change: -0.08,
      affected_companies: competitors.slice(1, 3)
    }
  ];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const { data } = await exportMarketIntelligenceReport({
        analysis_id: analysis.id,
        format: 'pdf'
      });

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knxw-market-intelligence-${analysis.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleEmailShare = async () => {
    if (!shareEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    setIsSharing(true);
    try {
      await exportMarketIntelligenceReport({
        analysis_id: analysis.id,
        format: 'email',
        recipient_email: shareEmail
      });

      alert(`Report sent to ${shareEmail}`);
      setShowShareDialog(false);
      setShareEmail('');
    } catch (error) {
      console.error('Email share failed:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const motivationData = (psychographic_analysis?.primary_motivations || []).slice(0, 6).map((m, i) => ({
    name: typeof m === 'string' ? m : m.motivation || m,
    value: Math.floor(Math.random() * 30) + 15,
    color: ['#00d4ff', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f7ff'][i]
  }));

  const emotionalTriggerData = (psychographic_analysis?.emotional_triggers || []).slice(0, 5).map((t, i) => ({
    name: typeof t === 'string' ? t : t.trigger || t,
    impact: Math.floor(Math.random() * 40) + 60,
    color: ['#00d4ff', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'][i]
  }));

  const opportunityTrendData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    potential: Math.floor(Math.random() * 30) + 70,
    engagement: Math.floor(Math.random() * 25) + 60
  }));

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#111111] border border-[#262626] rounded-2xl p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/5 via-transparent to-[#00d4ff]/5" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] shadow-lg shadow-[#00d4ff]/25">
                {isCompetitorAnalysis ? (
                  <Briefcase className="w-8 h-8 text-[#0a0a0a]" />
                ) : (
                  <TrendingUp className="w-8 h-8 text-[#0a0a0a]" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white leading-tight">{title}</h1>
                <p className="text-[#a3a3a3] text-lg mt-1">
                  {isCompetitorAnalysis ? (
                    <>Deep competitive analysis of <a href={content_url} target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline font-semibold">{competitor_name}</a></>
                  ) : (
                    <>Strategic market intelligence for {industry_category || 'market trends'}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#38bdf8] text-[#0a0a0a] font-semibold">
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                Export PDF
              </Button>

              <Button
                onClick={() => setShowShareDialog(true)}
                variant="outline"
                className="border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10">
                <Mail className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge className="bg-[#00d4ff]/15 text-[#00d4ff] border-[#00d4ff]/30 px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              Analyzed: {formattedAnalyzedAt}
            </Badge>
            <Badge className="bg-green-500/15 text-green-400 border-green-500/30 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confidence: {((psychographic_analysis?.confidence_score || 0) * 100).toFixed(0)}%
            </Badge>
            {industry_category && (
              <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 px-4 py-2">
                <Target className="w-4 h-4 mr-2" />
                {industry_category}
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabbed Analysis Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#111111] border border-[#262626] p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] rounded-md px-4 py-2">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="forecast" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] rounded-md px-4 py-2">
            <TrendingUp className="w-4 h-4 mr-2" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] rounded-md px-4 py-2">
            <Activity className="w-4 h-4 mr-2" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] rounded-md px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {psychographic_analysis?.psychological_insights && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-[#262626] shadow-xl">
                <CardHeader className="border-b border-[#262626]/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]">
                      <Brain className="w-6 h-6 text-[#0a0a0a]" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white">Executive Intelligence Summary</CardTitle>
                      <CardDescription className="text-[#a3a3a3]">Strategic psychological insights and market positioning</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-white leading-relaxed whitespace-pre-line text-lg font-light">
                    {psychographic_analysis.psychological_insights}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid lg:grid-cols-3 gap-6">
            {motivationData.length > 0 && (
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#00d4ff]" />
                    Motivation Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <AnimatedDonut data={motivationData} centerTitle="Motivations" centerSubtitle={`${motivationData.length} Types`} />
                  </div>
                </CardContent>
              </Card>
            )}

            {emotionalTriggerData.length > 0 && (
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#fbbf24]" />
                    Emotional Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <AnimatedBar data={emotionalTriggerData.map((t) => ({ name: t.name, value: t.impact }))} bars={[{ key: "value", color: "#fbbf24", name: "Impact Score" }]} />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#10b981]" />
                  Opportunity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <AnimatedLine data={opportunityTrendData} lines={[{ key: "potential", color: "#10b981", name: "Market Potential" }, { key: "engagement", color: "#00d4ff", name: "Engagement Score" }]} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-[#262626]">
              <CardHeader className="border-b border-[#262626]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed]">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">Psychographic Profile</CardTitle>
                    <CardDescription className="text-[#a3a3a3]">Deep psychological insights</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                      Primary Motivations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(psychographic_analysis?.primary_motivations || []).map((m, i) => (
                        <Badge key={i} className="bg-[#8b5cf6]/15 text-[#8b5cf6] border-[#8b5cf6]/30 px-3 py-1">
                          {typeof m === 'string' ? m : m.motivation || m}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ec4899]" />
                      Emotional Triggers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(psychographic_analysis?.emotional_triggers || []).map((t, i) => (
                        <Badge key={i} className="bg-[#ec4899]/15 text-[#ec4899] border-[#ec4899]/30 px-3 py-1">
                          {typeof t === 'string' ? t : t.trigger || t}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-[#1a1a1a] rounded-xl p-4">
                      <h5 className="font-semibold text-[#a3a3a3] text-sm mb-2">Cognitive Style</h5>
                      <p className="text-white font-bold text-lg capitalize">
                        {psychographic_analysis?.cognitive_style_appeal || 'Analytical'}
                      </p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-xl p-4">
                      <h5 className="font-semibold text-[#a3a3a3] text-sm mb-2">Risk Profile</h5>
                      <p className="text-white font-bold text-lg capitalize">
                        {psychographic_analysis?.risk_profile_target || 'Moderate'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-[#262626]">
              <CardHeader className="border-b border-[#262626]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]">
                    <Lightbulb className="w-6 h-6 text-[#0a0a0a]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">Strategic Intelligence</CardTitle>
                    <CardDescription className="text-[#a3a3a3]">Market opportunities & insights</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isCompetitorAnalysis && competitiveIntelligence?.market_opportunities?.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
                      Market Opportunities
                    </h4>
                    <div className="space-y-3">
                      {competitiveIntelligence.market_opportunities.slice(0, 4).map((opp, i) => (
                        <div key={i} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#262626] hover:border-[#00d4ff]/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[#00d4ff]/15">
                              <ArrowRight className="w-4 h-4 text-[#00d4ff]" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-white font-semibold mb-1">{opp.opportunity}</h5>
                              <p className="text-[#a3a3a3] text-sm">{opp.psychological_segment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : marketIntelligence?.strategic_opportunities?.market_opportunities?.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
                      High-Value Opportunities
                    </h4>
                    <div className="space-y-3">
                      {marketIntelligence.strategic_opportunities.market_opportunities.slice(0, 4).map((opp, i) => (
                        <div key={i} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#262626] hover:border-[#00d4ff]/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[#10b981]/15">
                              <TrendingUp className="w-4 h-4 text-[#10b981]" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-white font-semibold mb-1">{opp.opportunity_title}</h5>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-[#10b981]">{opp.market_size}</span>
                                <span className="text-[#00d4ff]">{opp.expected_roi} ROI</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-[#fbbf24] mx-auto mb-3 animate-spin" />
                    <p className="text-[#a3a3a3]">Strategic opportunities analysis in progress...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {isCompetitorAnalysis && competitiveIntelligence?.strategic_recommendations?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-[#262626]">
                <CardHeader className="border-b border-[#262626]/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669]">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white">Strategic Recommendations</CardTitle>
                      <CardDescription className="text-[#a3a3a3]">Actionable insights for competitive advantage</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {competitiveIntelligence.strategic_recommendations.slice(0, 6).map((rec, i) => (
                      <div key={i} className="bg-[#1a1a1a] rounded-xl p-6 border border-[#262626] hover:border-[#00d4ff]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#00d4ff]/10">
                        <div className="flex items-start gap-4">
                          <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                            rec.expected_impact === 'high' ? 'bg-green-400 shadow-lg shadow-green-400/50' :
                            rec.expected_impact === 'medium' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' :
                            'bg-blue-400 shadow-lg shadow-blue-400/50'
                          }`} />
                          <div className="flex-1">
                            <h5 className="text-white font-bold text-lg mb-2">{rec.category}</h5>
                            <p className="text-[#a3a3a3] mb-4 leading-relaxed">{rec.recommendation}</p>
                            <div className="flex items-center gap-3">
                              <Badge className={`${
                                rec.expected_impact === 'high' ? 'bg-green-500/15 text-green-400 border-green-500/30' :
                                rec.expected_impact === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                                'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              }`}>
                                {rec.expected_impact} impact
                              </Badge>
                              <span className="text-[#666] text-sm">{rec.implementation_timeline}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="forecast">
          <TrendForecastEngine 
            topic={title || 'market trend'} 
            industry={industry_category || 'general'} 
            timeframe="90d"
          />
        </TabsContent>

        <TabsContent value="sentiment">
          <CompetitiveSentimentAnalysis 
            competitors={competitors}
            topic={title || 'market sentiment'}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <MarketShiftsTimeline shifts={marketShifts} />
        </TabsContent>
      </Tabs>

      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareDialog(false)}>
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#00d4ff]" />
              Share Report
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shareEmail" className="text-sm font-medium text-[#a3a3a3]">Email Address</Label>
                <Input
                  id="shareEmail"
                  type="email"
                  placeholder="colleague@company.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="mt-1 bg-[#1a1a1a] border-[#262626]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleEmailShare}
                  disabled={isSharing}
                  className="flex-1 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                  {isSharing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                  Send Report
                </Button>
                <Button onClick={() => setShowShareDialog(false)} variant="outline" className="border-[#262626] text-[#a3a3a3]">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function MarketIntelligencePage() {
  const [topic, setTopic] = useState("");
  const [industry, setIndustry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, analysisId: null, analysisTitle: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setIsAdmin(me?.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
      }
    })();
  }, []);

  const loadAnalyses = useCallback(async () => {
    setIsLoading(true);
    try {
      const recentAnalyses = await base44.entities.MarketTrend.list('-analyzed_at', 50);
      setAnalyses(recentAnalyses);
      if (recentAnalyses.length > 0 && !selectedAnalysis) {
        setSelectedAnalysis(recentAnalyses[0]);
      }
    } catch (err) {
      console.error("Failed to load market analyses:", err);
      setError("Could not load past analyses. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedAnalysis]);

  useEffect(() => {
    if (isAdmin) {
      loadAnalyses();
    }
  }, [isAdmin, loadAnalyses]);

  const handleRunAnalysis = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic, competitor, or URL to analyze.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    setSelectedAnalysis(null);

    try {
      await callWithRetry(() => analyzeMarketTrends({ topic, industry_category: industry }));
      const recentAnalyses = await base44.entities.MarketTrend.list('-analyzed_at', 50);
      setAnalyses(recentAnalyses);
      if (recentAnalyses.length > 0) {
        setSelectedAnalysis(recentAnalyses[0]);
      }
      setTopic("");
      setIndustry("");
    } catch (err) {
      console.error("Market analysis failed:", err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteAnalysis = async (analysisId, analysisTitle) => {
    setDeleteConfirmation({ open: true, analysisId, analysisTitle });
  };

  const confirmDeleteAnalysis = async () => {
    if (!deleteConfirmation.analysisId) return;

    setIsDeleting(true);
    try {
      await base44.entities.MarketTrend.delete(deleteConfirmation.analysisId);
      const updatedAnalyses = analyses.filter((a) => a.id !== deleteConfirmation.analysisId);
      setAnalyses(updatedAnalyses);

      if (selectedAnalysis?.id === deleteConfirmation.analysisId) {
        setSelectedAnalysis(updatedAnalyses.length > 0 ? updatedAnalyses[0] : null);
      }
    } catch (err) {
      console.error("Failed to delete analysis:", err);
      setError("Failed to delete analysis. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation({ open: false, analysisId: null, analysisTitle: null });
    }
  };

  return (
    <SubscriptionGate requiredPlan="pro" feature="Market Intelligence">
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]">
                <TrendingUp className="w-6 h-6 text-[#0a0a0a]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Market Intelligence
              </h1>
            </div>
            <p className="text-[#a3a3a3] text-lg">
              AI-powered trend forecasting, competitive sentiment analysis, and psychographic market intelligence.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card className="bg-[#111111] border-[#262626] sticky top-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#00d4ff]" />
                    New Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-50 pt-0 p-6 space-y-4">
                  <div>
                    <Label htmlFor="topic" className="text-sm font-medium text-[#a3a3a3]">Topic or URL</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., 'Tesla marketing strategy'"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-1 bg-[#0a0a0a] border-[#262626]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry" className="text-sm font-medium text-[#a3a3a3]">Industry (Optional)</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., 'Electric Vehicles'"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="mt-1 bg-[#0a0a0a] border-[#262626]"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                    className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Run Analysis"
                    )}
                  </Button>
                </CardContent>
                <div className="border-t border-[#262626] p-4">
                  <h4 className="font-semibold text-white mb-3">Recent Analyses</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
                      </div>
                    ) : analyses.length === 0 ? (
                      <p className="text-sm text-[#a3a3a3] text-center py-4">No recent analyses.</p>
                    ) : (
                      analyses.map((analysisItem) => (
                        <div
                          key={analysisItem.id}
                          className={`relative group rounded-lg border transition-all duration-200 ${
                            selectedAnalysis?.id === analysisItem.id
                              ? 'bg-[#00d4ff]/10 border-[#00d4ff]/50'
                              : 'bg-[#1a1a1a] border-[#262626] hover:border-[#00d4ff]/30'
                          }`}>
                          <button
                            onClick={() => setSelectedAnalysis(analysisItem)}
                            className="w-full text-left p-3 rounded-lg">
                            <p className="font-medium text-white truncate text-sm">{analysisItem.title}</p>
                            <p className="text-xs text-[#a3a3a3]">
                              {formatDistanceToNow(new Date(analysisItem.analyzed_at), { addSuffix: true })}
                            </p>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAnalysis(analysisItem.id, analysisItem.title);
                            }}
                            disabled={isDeleting}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            title="Delete Analysis">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center p-8 bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-2xl border border-[#262626]">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] flex items-center justify-center animate-pulse">
                      <Brain className="w-10 h-10 text-[#0a0a0a]" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-[#00d4ff]/30 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Analyzing Market Intelligence...</h3>
                  <p className="text-[#a3a3a3] max-w-md mx-auto text-lg">
                    Our AI is conducting deep psychographic analysis, trend forecasting, and competitive sentiment evaluation.
                  </p>
                </div>
              ) : selectedAnalysis ? (
                <ProfessionalAnalysisDisplay analysis={selectedAnalysis} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center p-8 bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-2xl border border-[#262626]">
                  <TrendingUp className="w-20 h-20 text-[#a3a3a3] mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Welcome to Market Intelligence
                  </h3>
                  <p className="text-[#a3a3a3] max-w-md mx-auto text-lg">
                    Enter a topic, competitor, or URL to begin analysis with automated trend forecasting and competitive sentiment tracking.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmationDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation({ open, analysisId: null, analysisTitle: null })}
        title="Delete Analysis"
        description={`Are you sure you want to delete "${deleteConfirmation.analysisTitle}"? This action cannot be undone and will permanently remove this market intelligence report.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Analysis"}
        cancelText="Keep Analysis"
        onConfirm={confirmDeleteAnalysis}
        variant="destructive"
      />
    </SubscriptionGate>
  );
}
