import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, RefreshCw, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function CognitiveBiasDetector({ userId }) {
  const [biases, setBiases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const analyzeBiases = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('detectCognitiveBiases', {
        user_id: userId,
        time_window_days: 30
      });

      const data = response.data;
      setBiases(data.detected_biases || []);
      setLastAnalysis(data.timestamp);
    } catch (error) {
      console.error('Error detecting biases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      analyzeBiases();
    }
  }, [userId]);

  const getBiasColor = (strength) => {
    if (strength > 0.7) return 'text-red-400';
    if (strength > 0.4) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const getBiasBackground = (strength) => {
    if (strength > 0.7) return 'bg-red-500/10 border-red-500/20';
    if (strength > 0.4) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-blue-500/10 border-blue-500/20';
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="w-5 h-5" />
              Cognitive Bias Detection
            </CardTitle>
            <CardDescription className="text-[#a3a3a3]">
              AI-detected cognitive patterns and decision-making biases
            </CardDescription>
          </div>
          <Button
            onClick={analyzeBiases}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10 hover:text-[#00d4ff]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#a3a3a3]">Analyzing behavioral patterns...</p>
          </div>
        ) : biases.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-[#6b7280] mx-auto mb-3" />
            <p className="text-[#a3a3a3]">No cognitive biases detected yet</p>
            <p className="text-sm text-[#6b7280] mt-1">More behavioral data needed for analysis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {biases.map((bias, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getBiasBackground(bias.strength)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className={`font-semibold ${getBiasColor(bias.strength)}`}>
                      {bias.bias_name}
                    </h4>
                    <p className="text-sm text-[#a3a3a3] mt-1">{bias.explanation}</p>
                  </div>
                  <Badge className="bg-[#1a1a1a] text-white border-[#262626]">
                    {(bias.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#6b7280]">
                    <span>Strength</span>
                    <span>{(bias.strength * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={bias.strength * 100} className="h-2" />
                </div>
              </div>
            ))}

            {lastAnalysis && (
              <p className="text-xs text-[#6b7280] text-center pt-2">
                Last analyzed: {new Date(lastAnalysis).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}