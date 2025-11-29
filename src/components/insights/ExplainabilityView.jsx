
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Hash,
  Brain,
  TrendingUp,
  Search,
  Calendar,
  User,
  Zap,
  RefreshCw,
  Lightbulb, // Added Lightbulb icon
  Target     // Added Target icon
} from 'lucide-react';
import { User as UserEntity } from '@/entities/User';

export default function ExplainabilityView() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    operation_id: '',
    user_id: '',
    start_date: '',
    end_date: '',
    success_only: false
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [complianceReport, setComplianceReport] = useState(null);
  const [user, setUser] = useState(null);

  const loadAuditLogs = useCallback(async () => {
    if (!user || user.role !== 'admin') return;

    setIsLoading(true);
    try {
      // This would need to be implemented as a backend function
      // For now, we'll simulate the data structure
      const mockLogs = [
        {
          operation_id: 'op-123-456',
          timestamp: new Date().toISOString(),
          tenant_id: 'tenant-001',
          user_id: 'user-456',
          operation_type: 'psychographic_analysis',
          success: true,
          latency_ms: 2341,
          input_preview: 'I am passionate about innovation and love solving complex problems. I enjoy collaborating with diverse teams and leading initiatives that drive meaningful change. My approach is data-driven and always aims for practical, impactful solutions.',
          output_summary: {
            type: 'psychographic_analysis',
            personality_analysis: {
              openness: 85,
              conscientiousness: 72,
              extraversion: 64,
              agreeableness: 78,
              neuroticism: 32
            },
            risk_assessment: 'moderate',
            cognitive_assessment: 'analytical',
            insights_count: 4,
            recommendations_count: 6,
            profile_reasoning: { // New reasoning details for the expanded view
              personality_explanation: "The user's frequent use of 'innovation', 'problem-solving', and 'creativity' in their input suggests high openness and conscientiousness. Their focus on collaboration indicates strong agreeableness, while phrases implying leadership roles point to extraversion. Absence of negative emotional language suggests low neuroticism.",
              cognitive_style_rationale: "Analytical style inferred from structured language, focus on 'complex problems', and 'data-driven' implications. Evidenced by logical flow and emphasis on practical outcomes.",
              motivation_basis: "Motivation stems from intrinsic desire for impact and mastery, as well as extrinsic recognition for innovative solutions. Driven by challenging tasks and opportunities for growth.",
              confidence_factors: ['NLP keyword extraction', 'sentiment analysis', 'topic modeling', 'semantic similarity']
            }
          },
          confidence_scores: {
            personality_analysis: 0.87,
            emotional_analysis: 0.74,
            overall_analysis: 0.82,
            motivation_analysis: 0.85, // New: maps to motivation_confidence_score
            risk_profile: 0.70,      // New: maps to risk_profile_confidence_score
            cognitive_style: 0.90    // New: maps to cognitive_style_confidence_score
          },
          validation_results: {
            input_valid: true,
            output_valid: true,
            warnings: []
          }
        },
        {
          operation_id: 'op-789-012',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          tenant_id: 'tenant-002',
          user_id: 'user-789',
          operation_type: 'emotional_sentiment_analysis',
          success: false, // Make this one fail for testing
          latency_ms: 5120,
          input_preview: 'I am extremely disappointed with the service and the lack of communication. This is unacceptable.',
          output_summary: {
            type: 'emotional_sentiment_analysis',
            sentiment: 'negative',
            emotion_breakdown: {
              anger: 0.75,
              sadness: 0.60,
              disgust: 0.40,
              fear: 0.10,
              joy: 0.05
            },
            risk_assessment: 'high',
            cognitive_assessment: 'emotional-reactive',
            insights_count: 1,
            recommendations_count: 1,
            profile_reasoning: {
              personality_explanation: "User displays high neuroticism due to strong negative emotional expression and explicit disappointment. Lack of solution-oriented language suggests lower conscientiousness in this specific context.",
              cognitive_style_rationale: "Primarily emotional-reactive, evidenced by direct expression of feelings and focus on immediate dissatisfaction rather than structured problem description.",
              motivation_basis: "Motivation driven by a desire for resolution and accountability, likely triggered by unmet expectations or perceived injustice.",
              confidence_factors: ['sentiment analysis', 'emotion detection models']
            }
          },
          confidence_scores: {
            personality_analysis: 0.60,
            emotional_analysis: 0.95,
            overall_analysis: 0.78,
            motivation_analysis: 0.70,
            risk_profile: 0.85,
            cognitive_style: 0.75
          },
          validation_results: {
            input_valid: true,
            output_valid: false,
            warnings: ["Output sentiment did not match expected range for intense negative input.", "High latency warning."]
          }
        }
      ];

      setAuditLogs(mockLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await UserEntity.me();
        if (currentUser.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadAuditLogs();
    }
  }, [user, filters, loadAuditLogs]);

  const generateReport = async () => {
    if (!user || user.role !== 'admin') return;

    try {
      const startDate = filters.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = filters.end_date || new Date().toISOString().split('T')[0];

      // Mock compliance report - this would call the actual backend function
      const report = {
        tenant_id: 'all',
        report_period: { start_date: startDate, end_date: endDate },
        generated_at: new Date().toISOString(),
        summary: {
          total_operations: 1247,
          successful_operations: 1198,
          failed_operations: 49,
          avg_latency_ms: 2156
        },
        quality_metrics: {
          operations_with_high_confidence: 892,
          validation_failures: 15
        },
        compliance_indicators: {
          pii_detection_enabled: true,
          audit_log_retention: true,
          explainability_tracking: true,
          input_sanitization: true
        },
        error_analysis: {
          'LLM timeout': 28,
          'Input validation failed': 12,
          'Response validation failed': 9
        }
      };

      setComplianceReport(report);
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Required</h2>
          <p className="text-[#a3a3a3]">Admin privileges are required to view explainability logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Explainability & Audit</h1>
            <p className="text-[#a3a3a3]">Monitor and audit LLM operations for compliance and transparency</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={generateReport} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button onClick={loadAuditLogs} variant="outline" className="border-[#262626] text-white hover:bg-[#1a1a1a]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-[#111111] border-[#262626] mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Search className="w-5 h-5" />
              Audit Log Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Operation ID"
                value={filters.operation_id}
                onChange={(e) => setFilters({...filters, operation_id: e.target.value})}
                className="bg-[#1a1a1a] border-[#262626] text-white"
              />
              <Input
                placeholder="User ID"
                value={filters.user_id}
                onChange={(e) => setFilters({...filters, user_id: e.target.value})}
                className="bg-[#1a1a1a] border-[#262626] text-white"
              />
              <Input
                type="date"
                placeholder="Start Date"
                value={filters.start_date}
                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                className="bg-[#1a1a1a] border-[#262626] text-white"
              />
              <Input
                type="date"
                placeholder="End Date"
                value={filters.end_date}
                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                className="bg-[#1a1a1a] border-[#262626] text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Compliance Report */}
        {complianceReport && (
          <Card className="bg-[#111111] border-[#262626] mb-6">
            <CardHeader>
              <CardTitle className="text-white">Compliance Report</CardTitle>
              <p className="text-[#a3a3a3] text-sm">
                Generated: {new Date(complianceReport.generated_at).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-[#00d4ff]">
                    {complianceReport.summary.total_operations.toLocaleString()}
                  </div>
                  <div className="text-sm text-[#a3a3a3]">Total Operations</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-[#10b981]">
                    {((complianceReport.summary.successful_operations / complianceReport.summary.total_operations) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-[#a3a3a3]">Success Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-[#fbbf24]">
                    {complianceReport.summary.avg_latency_ms}ms
                  </div>
                  <div className="text-sm text-[#a3a3a3]">Avg Latency</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-[#ec4899]">
                    {complianceReport.quality_metrics.operations_with_high_confidence}
                  </div>
                  <div className="text-sm text-[#a3a3a3]">High Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Logs */}
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Eye className="w-5 h-5" />
              Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="w-8 h-8 animate-spin text-[#00d4ff]" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center h-48 flex items-center justify-center">
                <p className="text-[#a3a3a3]">No audit logs found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div
                    key={log.operation_id}
                    onClick={() => setSelectedLog(selectedLog?.operation_id === log.operation_id ? null : log)}
                    className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626] cursor-pointer hover:border-[#00d4ff]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-[#a3a3a3]" />
                        <span className="font-mono text-sm text-white">{log.operation_id}</span>
                        {log.success ? (
                          <CheckCircle className="w-4 h-4 text-[#10b981]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#ef4444]" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#a3a3a3]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.latency_ms}ms
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <Badge variant="outline" className="text-xs">
                        <User className="w-3 h-3 mr-1" />
                        {log.user_id}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Brain className="w-3 h-3 mr-1" />
                        {log.operation_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {Math.round((log.confidence_scores?.overall_analysis || 0) * 100)}% confidence
                      </Badge>
                    </div>

                    <div className="text-sm text-[#a3a3a3] mb-3">
                      Input: "{log.input_preview.substring(0, 100)}..."
                    </div>

                    {selectedLog?.operation_id === log.operation_id && (
                      <div className="mt-4 pt-4 border-t border-[#262626] space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Analysis Results</h4>
                          {log.output_summary?.personality_analysis && (
                            <div className="grid grid-cols-5 gap-2 mb-3">
                              {Object.entries(log.output_summary.personality_analysis).map(([trait, score]) => (
                                <div key={trait} className="text-center">
                                  <div className="text-xs text-[#a3a3a3] capitalize mb-1">{trait}</div>
                                  <div className="text-sm font-semibold text-white">{score}%</div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-[#a3a3a3]">
                            Risk: {log.output_summary?.risk_assessment} •
                            Style: {log.output_summary?.cognitive_assessment} •
                            Insights: {log.output_summary?.insights_count} •
                            Recommendations: {log.output_summary?.recommendations_count}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Quality Metrics</h4>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-[#a3a3a3]">Personality:</span>
                              <span className="ml-2 text-white">{Math.round((log.confidence_scores?.personality_analysis || 0) * 100)}%</span>
                            </div>
                            <div>
                              <span className="text-[#a3a3a3]">Emotional:</span>
                              <span className="ml-2 text-white">{Math.round((log.confidence_scores?.emotional_analysis || 0) * 100)}%</span>
                            </div>
                            <div>
                              <span className="text-[#a3a3a3]">Overall:</span>
                              <span className="ml-2 text-white">{Math.round((log.confidence_scores?.overall_analysis || 0) * 100)}%</span>
                            </div>
                          </div>
                        </div>

                        {log.validation_results?.warnings?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              Warnings
                            </h4>
                            <div className="space-y-1">
                              {log.validation_results.warnings.map((warning, idx) => (
                                <div key={idx} className="text-xs text-yellow-400">{warning}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* New AI Reasoning & Explainability section */}
                        <div className="space-y-6 pt-4 border-t border-[#262626]">
                          {log.output_summary?.profile_reasoning && (
                            <Card className="bg-[#111111] border-[#00d4ff]/30">
                              <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                  <Brain className="w-5 h-5 text-[#00d4ff]" />
                                  AI Reasoning & Explainability
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {log.output_summary.profile_reasoning.personality_explanation && (
                                  <div>
                                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                      <User className="w-4 h-4 text-[#8b5cf6]" />
                                      Personality Analysis
                                    </h4>
                                    <p className="text-[#e5e5e5] text-sm leading-relaxed">{log.output_summary.profile_reasoning.personality_explanation}</p>
                                  </div>
                                )}

                                {log.output_summary.profile_reasoning.cognitive_style_rationale && (
                                  <div>
                                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                      <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
                                      Cognitive Style
                                    </h4>
                                    <p className="text-[#e5e5e5] text-sm leading-relaxed">{log.output_summary.profile_reasoning.cognitive_style_rationale}</p>
                                  </div>
                                )}

                                {log.output_summary.profile_reasoning.motivation_basis && (
                                  <div>
                                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                      <Target className="w-4 h-4 text-[#10b981]" />
                                      Motivation Basis
                                    </h4>
                                    <p className="text-[#e5e5e5] text-sm leading-relaxed">{log.output_summary.profile_reasoning.motivation_basis}</p>
                                  </div>
                                )}

                                {log.output_summary.profile_reasoning.confidence_factors && (
                                  <div>
                                    <h4 className="text-white font-semibold mb-2">Confidence Factors</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {log.output_summary.profile_reasoning.confidence_factors.map((factor, idx) => (
                                        <Badge key={idx} className="bg-[#00d4ff]/20 text-[#00d4ff] border-none">
                                          {factor}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          <Card className="bg-[#111111] border-[#262626]">
                            <CardHeader>
                              <CardTitle className="text-white">Confidence Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {[
                                { label: 'Motivation Analysis', score: log.confidence_scores?.motivation_analysis, color: '#10b981' },
                                { label: 'Emotional State', score: log.confidence_scores?.emotional_analysis, color: '#ec4899' },
                                { label: 'Risk Profile', score: log.confidence_scores?.risk_profile, color: '#f59e0b' },
                                { label: 'Cognitive Style', score: log.confidence_scores?.cognitive_style, color: '#00d4ff' },
                                { label: 'Personality Traits', score: log.confidence_scores?.personality_analysis, color: '#8b5cf6' }
                              ].map(({ label, score, color }) => (
                                <div key={label} className="flex items-center justify-between">
                                  <span className="text-[#a3a3a3]">{label}</span>
                                  <div className="flex items-center gap-3">
                                    <div className="w-32 bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                                      <div
                                        className="h-full"
                                        style={{ width: `${(score || 0) * 100}%`, backgroundColor: color }}
                                      />
                                    </div>
                                    <Badge className="bg-[#262626] text-white border-none font-semibold w-14 justify-center">
                                      {Math.round((score || 0) * 100)}%
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
