
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { abTestManager } from "@/functions/abTestManager";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts';
import { 
    TrendingUp, 
    TrendingDown, 
    Users, 
    Target, 
    Award, 
    AlertTriangle,
    CheckCircle,
    Clock,
    Play,
    Pause,
    Crown
} from 'lucide-react';

export default function ABTestResults({ test, onStopTest, onPromoteWinner }) {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadResults = useCallback(async () => {
        try {
            setRefreshing(true);
            const { data } = await abTestManager({
                action: 'analyze_test',
                ab_test_id: test.id
            });
            setResults(data);
        } catch (error) {
            console.error('Error loading test results:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [test.id]); // Dependency for useCallback

    useEffect(() => {
        loadResults();
        
        // Auto-refresh every 30 seconds for running tests
        let interval;
        if (test.status === 'running') {
            interval = setInterval(loadResults, 30000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [test.id, test.status, loadResults]); // Added loadResults to useEffect dependencies

    const handleStopTest = async () => {
        if (window.confirm('Are you sure you want to stop this test? This action cannot be undone.')) {
            await onStopTest();
            loadResults();
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'running': return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
            case 'completed': return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
            case 'paused': return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30';
            default: return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
        }
    };

    const getSignificanceColor = (isSignificant, lift) => {
        if (!isSignificant) return 'text-[#6b7280]';
        return lift > 0 ? 'text-[#10b981]' : 'text-[#ef4444]';
    };

    const formatPercentage = (value, decimals = 2) => {
        return `${(value * 100).toFixed(decimals)}%`;
    };

    const formatLift = (lift) => {
        if (lift === null || lift === undefined) return 'N/A';
        const sign = lift >= 0 ? '+' : '';
        return `${sign}${lift.toFixed(2)}%`;
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="bg-[#111111] border-[#262626] animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 bg-[#262626] rounded mb-4" />
                            <div className="h-20 bg-[#262626] rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!results) {
        return (
            <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Results Available</h3>
                    <p className="text-[#a3a3a3]">Unable to load test results. Please try again.</p>
                </CardContent>
            </Card>
        );
    }

    // Prepare chart data
    const chartData = [
        {
            name: results.control?.name || 'Control',
            participants: results.control?.participants || 0,
            conversions: results.control?.conversions || 0,
            rate: (results.control?.conversion_rate || 0) * 100
        },
        ...results.variants.map(variant => ({
            name: variant.name,
            participants: variant.participants,
            conversions: variant.conversions,
            rate: (variant.conversion_rate || 0) * 100
        }))
    ];

    // Find best performing variant
    const bestVariant = results.variants.reduce((best, current) => 
        (current.conversion_rate || 0) > (best.conversion_rate || 0) ? current : best
    , results.variants[0]);

    return (
        <div className="space-y-6">
            {/* Header with controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(results.status)}>
                        {results.status === 'running' && <Play className="w-3 h-3 mr-1" />}
                        {results.status === 'paused' && <Pause className="w-3 h-3 mr-1" />}
                        {results.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {results.status}
                    </Badge>
                    <span className="text-[#a3a3a3]">•</span>
                    <span className="text-sm text-[#a3a3a3]">
                        {results.total_participants} total participants
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadResults}
                        disabled={refreshing}
                        className="border-[#262626] hover:bg-[#1a1a1a]"
                    >
                        <Clock className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    
                    {results.status === 'running' && (
                        <Button
                            size="sm"
                            onClick={handleStopTest}
                            className="bg-[#ef4444] hover:bg-[#dc2626] text-white"
                        >
                            <Pause className="w-4 h-4 mr-2" />
                            Stop Test
                        </Button>
                    )}
                </div>
            </div>

            {/* Performance Overview */}
            <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <BarChart className="w-5 h-5" />
                        Performance Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                                <XAxis dataKey="name" stroke="#a3a3a3" />
                                <YAxis stroke="#a3a3a3" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#111111',
                                        border: '1px solid #262626',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="rate" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Results */}
            <div className="grid gap-4">
                {/* Control Group */}
                {results.control && (
                    <Card className="bg-[#111111] border-[#262626]">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    {results.control.name}
                                  </CardTitle>
                                <Badge className="bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30">
                                    Control
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-2xl font-bold text-white">
                                        {results.control.participants}
                                    </div>
                                    <div className="text-sm text-[#a3a3a3]">Participants</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">
                                        {results.control.conversions}
                                    </div>
                                    <div className="text-sm text-[#a3a3a3]">Conversions</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#00d4ff]">
                                        {formatPercentage(results.control.conversion_rate)}
                                    </div>
                                    <div className="text-sm text-[#a3a3a3]">Conversion Rate</div>
                                </div>
                                <div>
                                    <div className="text-sm text-[#a3a3a3] mb-1">Confidence Interval</div>
                                    {results.control.confidence_interval ? (
                                        <div className="text-sm text-white">
                                            {formatPercentage(results.control.confidence_interval.lower)} - {formatPercentage(results.control.confidence_interval.upper)}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-[#6b7280]">Need more data</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Test Variants */}
                {results.variants.map((variant, index) => (
                    <Card key={index} className={`bg-[#111111] border-[#262626] ${
                        variant === bestVariant && variant.lift_percentage > 0 ? 'ring-2 ring-[#10b981]/30' : ''
                    }`}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    {variant.name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {variant === bestVariant && variant.lift_percentage > 0 && (
                                        <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">
                                            <Crown className="w-3 h-3 mr-1" />
                                            Leading
                                        </Badge>
                                    )}
                                    {variant.statistical_significance?.is_significant && (
                                        <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">
                                            Significant
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-5 gap-4">
                                <div>
                                    <div className="text-2xl font-bold text-white">
                                        {variant.participants}
                                    </div>
                                    <div className="text-sm text-[#a3a3a3]">Participants</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">
                                        {variant.conversions}
                                    </div>
                                    <div className="text-sm text-[#a3a3a3]">Conversions</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#00d4ff]">
                                        {formatPercentage(variant.conversion_rate)}
                                    </div>
                                    <div className="text-sm text-[#a3a3a3]">Conversion Rate</div>
                                </div>
                                <div>
                                    <div className={`text-2xl font-bold flex items-center gap-1 ${
                                        getSignificanceColor(
                                            variant.statistical_significance?.is_significant,
                                            variant.lift_percentage
                                        )
                                    }`}>
                                        {variant.lift_percentage !== null && variant.lift_percentage !== undefined ? (
                                            <>
                                                {variant.lift_percentage >= 0 ? 
                                                    <TrendingUp className="w-5 h-5" /> : 
                                                    <TrendingDown className="w-5 h-5" />
                                                }
                                                {formatLift(variant.lift_percentage)}
                                            </>
                                        ) : (
                                            'N/A'
                                        )}
                                    </div>
                                    <div className="text-sm text-[#a3a3a3]">Lift vs Control</div>
                                </div>
                                <div>
                                    <div className="text-sm text-[#a3a3a3] mb-1">Confidence</div>
                                    {variant.statistical_significance ? (
                                        <div className="text-sm text-white">
                                            {formatPercentage(1 - variant.statistical_significance.p_value)} confident
                                        </div>
                                    ) : (
                                        <div className="text-sm text-[#6b7280]">Calculating...</div>
                                    )}
                                </div>
                            </div>

                            {variant.confidence_interval && (
                                <div className="mt-4">
                                    <div className="text-sm text-[#a3a3a3] mb-2">
                                        Confidence Interval: {formatPercentage(variant.confidence_interval.lower)} - {formatPercentage(variant.confidence_interval.upper)}
                                    </div>
                                    <Progress 
                                        value={(variant.conversion_rate || 0) * 100} 
                                        className="h-2"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
                <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {results.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {rec.type === 'potential_winner' && <Crown className="w-4 h-4 text-[#fbbf24]" />}
                                        {rec.type === 'sample_size' && <Users className="w-4 h-4 text-[#00d4ff]" />}
                                        {rec.type === 'statistical' && <BarChart className="w-4 h-4 text-[#10b981]" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-white">{rec.message}</p>
                                        <div className="mt-2">
                                            <Badge className="bg-[#262626] text-[#a3a3a3] text-xs">
                                                {rec.action}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
