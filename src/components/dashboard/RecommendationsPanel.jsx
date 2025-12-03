import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { 
  FileText, 
  BookOpen, 
  Play, 
  Settings, 
  ExternalLink,
  Loader2,
  Brain,
  Target,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { callWithRetry } from '@/components/system/apiRetry';
import logger from '@/components/system/logger';

const getContentIcon = (type) => {
  const icons = {
    blog_post: FileText,
    documentation: BookOpen,
    help_article: FileText,
    feature_guide: Settings,
    tutorial: Play
  };
  return icons[type] || FileText;
};

export default function RecommendationsPanel({ userId, compact = false }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadingRef = React.useRef(false);
  const lastLoadTimeRef = React.useRef(0);

  const loadRecommendations = useCallback(async () => {
    if (!userId) return;

    // Prevent concurrent loads
    if (loadingRef.current) {
      logger.info("Recommendations load already in progress, skipping");
      return;
    }

    // Rate limit to max once per 60 seconds
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    if (timeSinceLastLoad < 60000 && hasLoaded) {
      logger.info(`Recommendations loaded ${Math.round(timeSinceLastLoad / 1000)}s ago, waiting`);
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const recs = await callWithRetry(
        () => base44.entities.ContentRecommendation.filter(
          { user_id: userId }, 
          '-generated_at', 
          compact ? 3 : 10
        ),
        {
          retries: 1,
          baseDelayMs: 2000,
          maxDelayMs: 5000,
          retryOnStatus: [429, 502, 503, 504]
        }
      );
      
      setRecommendations(recs);
      setHasLoaded(true);
      lastLoadTimeRef.current = Date.now();
      
      // If no recommendations exist, generate them
      if (recs.length === 0) {
        await generateRecommendations();
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 429) {
        logger.warn('Recommendations panel rate limited');
        setError('Rate limited - try again in a minute');
      } else {
        logger.error('Failed to load recommendations:', error);
        setError('Failed to load recommendations');
      }
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [userId, compact, hasLoaded]);

  const generateRecommendations = useCallback(async () => {
    if (!userId) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('generateContentRecommendations', { 
        user_id: userId,
        refresh: false 
      });
      
      if (response.data?.success) {
        setRecommendations(response.data.recommendations);
        setHasLoaded(true);
        lastLoadTimeRef.current = Date.now();
      } else {
        setError('Failed to generate recommendations');
      }
    } catch (error) {
      logger.error('Failed to generate recommendations:', error);
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [userId]);

  const handleInteraction = useCallback(async (recommendationId, interactionType, data = {}) => {
    try {
      const response = await base44.functions.invoke('trackRecommendationInteraction', {
        recommendation_id: recommendationId,
        interaction_type: interactionType,
        data
      });

      if (response.data?.success) {
        // Update local state optimistically
        setRecommendations(prev => prev.map(rec => {
          if (rec.id === recommendationId) {
            return {
              ...rec,
              interaction_data: {
                ...(rec.interaction_data || {}),
                [interactionType]: true,
                last_interaction: new Date().toISOString(),
                ...data
              }
            };
          }
          return rec;
        }));
      }
    } catch (error) {
      logger.error('Failed to track interaction:', error);
      // Silently fail - don't disrupt user experience for analytics
    }
  }, []);

  const handleRefresh = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('generateContentRecommendations', { 
        user_id: userId,
        refresh: true 
      });
      
      if (response.data?.success) {
        setRecommendations(response.data.recommendations);
        lastLoadTimeRef.current = Date.now();
      } else {
        setError('Failed to refresh recommendations');
      }
    } catch (error) {
      logger.error('Failed to refresh recommendations:', error);
      setError('Failed to refresh recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const RecommendationCard = ({ recommendation, onInteraction }) => {
    const IconComponent = getContentIcon(recommendation.content_type);
    const isViewed = recommendation.interaction_data?.viewed;
    const isClicked = recommendation.interaction_data?.clicked;
    
    const handleClick = async () => {
      await onInteraction(recommendation.id, 'clicked');
      
      // Navigate to content
      if (recommendation.content_url.startsWith('/')) {
        window.location.href = recommendation.content_url;
      } else {
        window.open(recommendation.content_url, '_blank');
      }
    };

    const handleView = useCallback(async () => {
      if (!isViewed) {
        await onInteraction(recommendation.id, 'viewed');
      }
    }, [recommendation.id, isViewed, onInteraction]);

    // Track view when component comes into view
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isViewed) {
            handleView();
          }
        },
        { threshold: 0.5 }
      );

      const element = document.getElementById(`rec-${recommendation.id}`);
      if (element) observer.observe(element);

      return () => observer.disconnect();
    }, [recommendation.id, isViewed, handleView]);

    const match = recommendation.psychographic_match || {};
    const scorePercent = Math.round((recommendation.confidence_score || 0) * 100);

    return (
      <div 
        id={`rec-${recommendation.id}`}
        className={`bg-[#0a0a0a] border rounded-lg p-4 hover:border-[#00d4ff]/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all duration-300 cursor-pointer ${
          isViewed ? 'border-[#262626]' : 'border-[#00d4ff]/20'
        } ${isClicked ? 'bg-[#00d4ff]/5' : ''}`}
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#00d4ff]/10 rounded-lg flex-shrink-0">
            <IconComponent className="w-4 h-4 text-[#00d4ff]" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white text-sm truncate pr-2">
                {recommendation.content_title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs">
                  {scorePercent}% match
                </Badge>
                {isClicked && <Badge className="bg-[#10b981]/20 text-[#10b981] text-xs">Clicked</Badge>}
              </div>
            </div>
            
            <div className="text-xs text-[#6b7280] mb-2 capitalize">
              {recommendation.content_type.replace('_', ' ')} • {match.cognitive_style_match || 'General'} Style
            </div>
            
            {match.motivation_alignment && match.motivation_alignment.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {match.motivation_alignment.slice(0, 2).map((motivation, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded">
                    {motivation}
                  </span>
                ))}
              </div>
            )}
            
            {match.match_reasoning && (
              <p className="text-xs text-[#a3a3a3] line-clamp-2">
                {match.match_reasoning}
              </p>
            )}
          </div>
          
          <ExternalLink className="w-3 h-3 text-[#6b7280] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {!hasLoaded && !isLoading ? (
          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4 text-center">
            <Brain className="w-8 h-8 text-[#404040] mx-auto mb-2" />
            <p className="text-xs text-[#a3a3a3] mb-3">
              Get personalized content recommendations
            </p>
            <Button
              onClick={loadRecommendations}
              size="sm"
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              Load Recommendations
            </Button>
          </div>
        ) : error ? (
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg p-3 text-center">
            <AlertCircle className="w-4 h-4 text-[#ef4444] mx-auto mb-2" />
            <p className="text-xs text-[#ef4444]">{error}</p>
            <Button
              onClick={loadRecommendations}
              disabled={isLoading || isGenerating}
              size="sm"
              className="mt-2 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              Retry
            </Button>
          </div>
        ) : (
          recommendations.slice(0, 3).map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} onInteraction={handleInteraction} />
          ))
        )}
      </div>
    );
  }

  return (
    <Card className="bg-[#111111] border-[#262626] transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,212,255,0.2)] hover:border-[#00d4ff]/40">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00d4ff]" />
            Personalized Recommendations
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isGenerating}
              size="sm"
              variant="outline"
              className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]"
            >
              {isGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-sm text-[#a3a3a3]">
          Content tailored to your needs
        </p>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {!hasLoaded && !isLoading ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-[#404040] mx-auto mb-4" />
            <p className="text-[#6b7280] mb-4">Load AI-powered content recommendations</p>
            <Button 
              onClick={loadRecommendations}
              disabled={isLoading || isGenerating}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              {isLoading || isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Recommendations'
              )}
            </Button>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
            <p className="text-[#ef4444] mb-4">{error}</p>
            <Button 
              onClick={loadRecommendations}
              disabled={isLoading || isGenerating}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              {isLoading || isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                'Retry'
              )}
            </Button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-[#404040] mx-auto mb-4" />
            <p className="text-[#6b7280] mb-4">No recommendations available yet.</p>
            <Button 
              onClick={generateRecommendations}
              disabled={isGenerating}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Recommendations'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} onInteraction={handleInteraction} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}