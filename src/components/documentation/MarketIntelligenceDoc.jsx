import React from 'react';
import { TrendingUp, Brain, BarChart3, Activity, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function MarketIntelligenceDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-[#fbbf24]" />
        Market Intelligence Documentation
      </h2>

      <p className="text-[#a3a3a3] text-lg mb-8">
        Leverage AI-powered psychographic analysis to understand market trends, forecast competitor movements, 
        and gain strategic insights through automated competitive sentiment analysis.
      </p>

      {/* Overview */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Core Capabilities</h3>
      
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#00d4ff]" />
              Psychographic Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#a3a3a3]">
            Deep psychological profiling of market messaging, identifying motivations, 
            emotional triggers, and cognitive appeals in competitor content.
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#10b981]" />
              Trend Forecasting
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#a3a3a3]">
            90-day automated trend forecasting with confidence intervals, momentum analysis, 
            and key inflection point detection powered by AI.
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#ec4899]" />
              Sentiment Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#a3a3a3]">
            Real-time competitive sentiment analysis with 30-day historical tracking, 
            volatility scores, and sentiment driver identification.
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Getting Started</h3>

      <h4 className="text-xl font-semibold text-white mb-3">1. Run Your First Analysis</h4>
      <p className="text-[#a3a3a3] mb-4">
        Navigate to Market Intelligence and enter a topic, competitor name, or URL to analyze:
      </p>

      <div className="bg-[#111111] border border-[#262626] rounded-lg p-4 mb-6">
        <ul className="space-y-2 text-[#a3a3a3]">
          <li>• <strong className="text-white">Topic Analysis:</strong> "AI-powered customer service trends"</li>
          <li>• <strong className="text-white">Competitor Analysis:</strong> "Tesla marketing strategy"</li>
          <li>• <strong className="text-white">URL Analysis:</strong> Paste any competitor landing page or blog post</li>
        </ul>
      </div>

      <Callout type="info" title="Analysis Time">
        Most analyses complete in 30-60 seconds. Complex competitive analyses may take up to 2 minutes.
      </Callout>

      <h4 className="text-xl font-semibold text-white mb-3 mt-6">2. Explore Analysis Tabs</h4>
      <p className="text-[#a3a3a3] mb-4">
        Each analysis includes four comprehensive views:
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
          <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#00d4ff]" />
            Overview
          </h5>
          <p className="text-sm text-[#a3a3a3]">
            Executive summary, psychographic insights, motivation distribution, and strategic recommendations.
          </p>
        </div>

        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
          <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
            Forecast
          </h5>
          <p className="text-sm text-[#a3a3a3]">
            90-day trend forecast with momentum analysis, confidence intervals, and key inflection points.
          </p>
        </div>

        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
          <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#ec4899]" />
            Sentiment
          </h5>
          <p className="text-sm text-[#a3a3a3]">
            Competitive sentiment comparison, 30-day trends, sentiment drivers, and volatility analysis.
          </p>
        </div>

        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
          <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#fbbf24]" />
            Timeline
          </h5>
          <p className="text-sm text-[#a3a3a3]">
            Visual timeline of significant market shifts, disruptions, and competitive moves with impact scores.
          </p>
        </div>
      </div>

      {/* Advanced Features */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Advanced Features</h3>

      <h4 className="text-xl font-semibold text-white mb-3">Automated Trend Forecasting</h4>
      <p className="text-[#a3a3a3] mb-4">
        The forecasting engine uses historical data, current momentum, and AI prediction to project 90-day trends:
      </p>

      <div className="bg-[#111111] border border-[#262626] rounded-lg p-6 mb-6">
        <ul className="space-y-3 text-[#a3a3a3]">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00d4ff] mt-2 flex-shrink-0" />
            <div>
              <strong className="text-white">Momentum Detection:</strong> Identifies whether trends are accelerating, stable, or decelerating
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#10b981] mt-2 flex-shrink-0" />
            <div>
              <strong className="text-white">Confidence Intervals:</strong> Provides upper and lower bounds for predictions
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#fbbf24] mt-2 flex-shrink-0" />
            <div>
              <strong className="text-white">Inflection Points:</strong> Highlights key dates where significant changes are expected
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#ec4899] mt-2 flex-shrink-0" />
            <div>
              <strong className="text-white">Risk & Catalysts:</strong> Identifies factors that could accelerate or derail trends
            </div>
          </li>
        </ul>
      </div>

      <h4 className="text-xl font-semibold text-white mb-3">Competitive Sentiment Analysis</h4>
      <p className="text-[#a3a3a3] mb-4">
        Track sentiment scores for multiple competitors simultaneously with real-time monitoring:
      </p>

      <CodeBlock language="javascript" code={`// Sentiment scores range from -1 (negative) to +1 (positive)
const sentimentAnalysis = {
  competitors: [
    {
      name: "Competitor A",
      current_score: 0.72,  // Positive sentiment
      trend: "improving",
      volatility: 0.23,     // Low volatility = stable
      drivers: {
        positive: ["Innovation", "Customer service"],
        negative: ["Pricing concerns"]
      }
    }
  ]
}`} />

      <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-6 mb-6 mt-4">
        <h5 className="text-[#fbbf24] font-semibold mb-3">Sentiment Metrics Explained</h5>
        <ul className="space-y-2 text-[#a3a3a3] text-sm">
          <li>• <strong className="text-white">Current Score:</strong> Real-time sentiment from -1 (very negative) to +1 (very positive)</li>
          <li>• <strong className="text-white">Trend:</strong> Direction of sentiment movement (improving/declining/stable)</li>
          <li>• <strong className="text-white">Volatility:</strong> How rapidly sentiment changes (0-1, higher = more volatile)</li>
          <li>• <strong className="text-white">Drivers:</strong> Specific factors influencing positive or negative sentiment</li>
        </ul>
      </div>

      <h4 className="text-xl font-semibold text-white mb-3">Market Shifts Timeline</h4>
      <p className="text-[#a3a3a3] mb-4">
        Visual timeline displays significant market events with impact scores and affected entities:
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
          <Badge className="mb-2 bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">Sentiment Shifts</Badge>
          <p className="text-sm text-[#a3a3a3]">
            Tracks major changes in public perception and market sentiment
          </p>
        </div>

        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
          <Badge className="mb-2 bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30">Market Disruptions</Badge>
          <p className="text-sm text-[#a3a3a3]">
            Identifies technology breakthroughs and industry-shifting announcements
          </p>
        </div>

        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
          <Badge className="mb-2 bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30">Competitive Moves</Badge>
          <p className="text-sm text-[#a3a3a3]">
            Monitors strategic partnerships, acquisitions, and positioning changes
          </p>
        </div>

        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
          <Badge className="mb-2 bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30">Regulatory Changes</Badge>
          <p className="text-sm text-[#a3a3a3]">
            Tracks policy updates and compliance requirements affecting the market
          </p>
        </div>
      </div>

      {/* Export & Sharing */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Export & Sharing</h3>
      
      <p className="text-[#a3a3a3] mb-4">
        Share market intelligence reports with stakeholders via PDF export or email:
      </p>

      <div className="bg-[#111111] border border-[#262626] rounded-lg p-6 mb-6">
        <ul className="space-y-2 text-[#a3a3a3]">
          <li>• <strong className="text-white">PDF Export:</strong> Professional reports with charts, insights, and recommendations</li>
          <li>• <strong className="text-white">Email Sharing:</strong> Send reports directly to team members and stakeholders</li>
          <li>• <strong className="text-white">Custom Branding:</strong> Enterprise plans support branded report headers</li>
        </ul>
      </div>

      <Callout type="success" title="Pro Tier Feature">
        Market Intelligence with advanced forecasting and sentiment analysis is available on Pro and Enterprise plans.
      </Callout>

      {/* Best Practices */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Best Practices</h3>
      
      <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-6 mb-6">
        <h4 className="text-[#00d4ff] font-semibold mb-3">Maximizing Intelligence Value</h4>
        <ul className="space-y-2 text-[#a3a3a3] text-sm">
          <li>• Run weekly analyses on key competitors to track sentiment trends</li>
          <li>• Monitor inflection points in forecasts for strategic planning</li>
          <li>• Compare sentiment drivers across competitors to identify gaps</li>
          <li>• Use market shifts timeline to align product launches with favorable conditions</li>
          <li>• Export monthly reports for board presentations and strategic reviews</li>
        </ul>
      </div>
    </div>
  );
}