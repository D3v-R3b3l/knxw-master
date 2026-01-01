import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, Eye, Download, Trash2, Edit, Check, X, Clock,
  Heart, Brain, Target, Sparkles, Lock, Unlock, Bell, BellOff,
  FileText, CheckCircle, AlertCircle, HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/ui/PageHeader';

export default function UserDataPortal() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // For demo purposes, we'll create/fetch a UserDataProfile for the current user
  const { data: dataProfile, isLoading } = useQuery({
    queryKey: ['user-data-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const profiles = await base44.entities.UserDataProfile.filter({ user_id: user.id }, null, 1);
      if (profiles.length > 0) return profiles[0];
      
      // Create a default profile if none exists
      return await base44.entities.UserDataProfile.create({
        user_id: user.id,
        client_app_id: 'self',
        consent_status: {
          psychographic_profiling: true,
          behavioral_tracking: true,
          personalized_engagements: true,
          data_sharing_with_integrations: false,
          ai_inference: true
        },
        visible_profile: {
          top_motivations: ['Achievement', 'Growth', 'Efficiency'],
          communication_style: 'analytical',
          content_preferences: ['data-driven', 'concise', 'actionable'],
          engagement_preferences: {
            preferred_frequency: 'moderate',
            preferred_channels: ['in-app', 'email'],
            quiet_hours: { enabled: false }
          }
        },
        data_sources: [
          { source_type: 'behavioral_events', description: 'Page views, clicks, and interactions', data_points_count: 1247 },
          { source_type: 'session_data', description: 'Session duration and patterns', data_points_count: 89 },
          { source_type: 'engagement_responses', description: 'Your responses to check-ins', data_points_count: 23 }
        ],
        benefits_received: {
          personalized_experiences_count: 47,
          relevant_recommendations_count: 12,
          time_saved_estimate_minutes: 35
        }
      });
    },
    enabled: !!user
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.UserDataProfile.update(dataProfile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-data-profile']);
      toast.success('Preferences updated');
    }
  });

  const handleConsentChange = (key, value) => {
    updateMutation.mutate({
      consent_status: {
        ...dataProfile.consent_status,
        [key]: value
      }
    });
  };

  const handleDataRequest = async (type) => {
    const newRequest = {
      type,
      status: 'pending',
      requested_at: new Date().toISOString()
    };
    
    await updateMutation.mutateAsync({
      data_requests: [...(dataProfile.data_requests || []), newRequest]
    });
    
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} request submitted`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <PageHeader
          title="Your Data Profile"
          description="See, control, and benefit from your data"
          icon={Shield}
          docSection="privacy"
        />

        {/* Value Exchange Banner */}
        <Card className="bg-gradient-to-r from-[#00d4ff]/10 to-[#8b5cf6]/10 border-[#00d4ff]/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Your Data Creates Value</h3>
                <p className="text-sm text-[#a3a3a3]">Here's what you've gained from personalization</p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#00d4ff]">{dataProfile?.benefits_received?.personalized_experiences_count || 0}</p>
                  <p className="text-xs text-[#a3a3a3]">Personalized Experiences</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#10b981]">{dataProfile?.benefits_received?.relevant_recommendations_count || 0}</p>
                  <p className="text-xs text-[#a3a3a3]">Relevant Recommendations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#8b5cf6]">{dataProfile?.benefits_received?.time_saved_estimate_minutes || 0}m</p>
                  <p className="text-xs text-[#a3a3a3]">Time Saved</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#111] border border-[#262626]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <Eye className="w-4 h-4 mr-2" />
              What We Know
            </TabsTrigger>
            <TabsTrigger value="consent" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <Lock className="w-4 h-4 mr-2" />
              Privacy Controls
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <Bell className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <FileText className="w-4 h-4 mr-2" />
              Data Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Your Profile Summary */}
            <Card className="bg-[#111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#8b5cf6]" />
                  Your Inferred Profile
                </CardTitle>
                <CardDescription>Based on your interactions, here's what we understand about you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-[#a3a3a3] mb-3">Top Motivations</h4>
                  <div className="flex flex-wrap gap-2">
                    {(dataProfile?.visible_profile?.top_motivations || []).map((motivation, i) => (
                      <Badge key={i} className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30">
                        <Target className="w-3 h-3 mr-1" />
                        {motivation}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#a3a3a3] mb-3">Communication Style</h4>
                  <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30 capitalize">
                    {dataProfile?.visible_profile?.communication_style || 'Unknown'}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#a3a3a3] mb-3">Content Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {(dataProfile?.visible_profile?.content_preferences || []).map((pref, i) => (
                      <Badge key={i} className="bg-[#262626] text-[#a3a3a3] border-[#333]">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#262626]">
                  <p className="text-sm text-[#6b7280] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Think something's wrong? You can submit corrections below.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card className="bg-[#111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Data Sources</CardTitle>
                <CardDescription>Where your profile data comes from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dataProfile?.data_sources || []).map((source, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                      <div>
                        <h4 className="font-medium text-white capitalize">{source.source_type.replace('_', ' ')}</h4>
                        <p className="text-sm text-[#a3a3a3]">{source.description}</p>
                      </div>
                      <Badge className="bg-[#262626] text-[#a3a3a3]">
                        {source.data_points_count?.toLocaleString()} data points
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consent" className="space-y-6">
            <Card className="bg-[#111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Privacy Controls</CardTitle>
                <CardDescription>Control how your data is used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'psychographic_profiling', label: 'Psychographic Profiling', desc: 'Allow AI to understand your motivations and preferences', icon: Brain },
                  { key: 'behavioral_tracking', label: 'Behavioral Tracking', desc: 'Track page views, clicks, and interactions', icon: Eye },
                  { key: 'personalized_engagements', label: 'Personalized Engagements', desc: 'Receive personalized messages and recommendations', icon: Sparkles },
                  { key: 'ai_inference', label: 'AI Inference', desc: 'Use AI to generate insights about your behavior', icon: Target },
                  { key: 'data_sharing_with_integrations', label: 'Share with Integrations', desc: 'Share profile data with connected marketing tools', icon: Lock }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#262626]">
                        <item.icon className="w-4 h-4 text-[#a3a3a3]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{item.label}</h4>
                        <p className="text-sm text-[#a3a3a3]">{item.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={dataProfile?.consent_status?.[item.key] ?? true}
                      onCheckedChange={(v) => handleConsentChange(item.key, v)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-[#111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Engagement Preferences</CardTitle>
                <CardDescription>How you prefer to be contacted</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Communication Frequency</h4>
                  <div className="flex gap-3">
                    {['minimal', 'moderate', 'frequent'].map((freq) => (
                      <button
                        key={freq}
                        onClick={() => updateMutation.mutate({
                          visible_profile: {
                            ...dataProfile.visible_profile,
                            engagement_preferences: {
                              ...dataProfile.visible_profile?.engagement_preferences,
                              preferred_frequency: freq
                            }
                          }
                        })}
                        className={`px-4 py-2 rounded-lg capitalize transition-all ${
                          dataProfile?.visible_profile?.engagement_preferences?.preferred_frequency === freq
                            ? 'bg-[#00d4ff] text-black'
                            : 'bg-[#262626] text-[#a3a3a3] hover:bg-[#333]'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Preferred Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {['in-app', 'email', 'push', 'sms'].map((channel) => {
                      const isActive = dataProfile?.visible_profile?.engagement_preferences?.preferred_channels?.includes(channel);
                      return (
                        <button
                          key={channel}
                          onClick={() => {
                            const current = dataProfile?.visible_profile?.engagement_preferences?.preferred_channels || [];
                            const updated = isActive ? current.filter(c => c !== channel) : [...current, channel];
                            updateMutation.mutate({
                              visible_profile: {
                                ...dataProfile.visible_profile,
                                engagement_preferences: {
                                  ...dataProfile.visible_profile?.engagement_preferences,
                                  preferred_channels: updated
                                }
                              }
                            });
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                            isActive
                              ? 'bg-[#00d4ff] text-black'
                              : 'bg-[#262626] text-[#a3a3a3] hover:bg-[#333]'
                          }`}
                        >
                          {channel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                  <div className="flex items-center gap-3">
                    <BellOff className="w-5 h-5 text-[#a3a3a3]" />
                    <div>
                      <h4 className="font-medium text-white">Quiet Hours</h4>
                      <p className="text-sm text-[#a3a3a3]">Don't send notifications during certain hours</p>
                    </div>
                  </div>
                  <Switch
                    checked={dataProfile?.visible_profile?.engagement_preferences?.quiet_hours?.enabled}
                    onCheckedChange={(v) => updateMutation.mutate({
                      visible_profile: {
                        ...dataProfile.visible_profile,
                        engagement_preferences: {
                          ...dataProfile.visible_profile?.engagement_preferences,
                          quiet_hours: {
                            ...dataProfile.visible_profile?.engagement_preferences?.quiet_hours,
                            enabled: v
                          }
                        }
                      }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card className="bg-[#111] border-[#262626]">
                <CardContent className="p-6">
                  <Download className="w-8 h-8 text-[#00d4ff] mb-4" />
                  <h3 className="font-semibold text-white mb-2">Export My Data</h3>
                  <p className="text-sm text-[#a3a3a3] mb-4">Download a copy of all data we have about you</p>
                  <Button 
                    onClick={() => handleDataRequest('export')}
                    className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-black"
                  >
                    Request Export
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-[#ef4444]/30">
                <CardContent className="p-6">
                  <Trash2 className="w-8 h-8 text-[#ef4444] mb-4" />
                  <h3 className="font-semibold text-white mb-2">Delete My Data</h3>
                  <p className="text-sm text-[#a3a3a3] mb-4">Permanently remove all your data from our systems</p>
                  <Button 
                    onClick={() => handleDataRequest('deletion')}
                    variant="outline"
                    className="w-full border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10"
                  >
                    Request Deletion
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Request History */}
            <Card className="bg-[#111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Request History</CardTitle>
              </CardHeader>
              <CardContent>
                {(dataProfile?.data_requests || []).length === 0 ? (
                  <p className="text-center text-[#a3a3a3] py-8">No data requests yet</p>
                ) : (
                  <div className="space-y-3">
                    {(dataProfile?.data_requests || []).map((request, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                        <div className="flex items-center gap-3">
                          {request.type === 'export' ? (
                            <Download className="w-5 h-5 text-[#00d4ff]" />
                          ) : (
                            <Trash2 className="w-5 h-5 text-[#ef4444]" />
                          )}
                          <div>
                            <h4 className="font-medium text-white capitalize">{request.type} Request</h4>
                            <p className="text-xs text-[#6b7280]">{new Date(request.requested_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge className={
                          request.status === 'completed' ? 'bg-[#10b981]/20 text-[#10b981]' :
                          request.status === 'pending' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                          'bg-[#6b7280]/20 text-[#6b7280]'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}