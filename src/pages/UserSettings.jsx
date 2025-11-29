
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { 
  User, 
  Bell, 
  Shield, 
  Key, 
  Loader2, 
  Save,
  Copy,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '../components/ui/PageHeader';

export default function UserSettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: ''
  });
  
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_insights: true,
    email_churn_alerts: true,
    email_weekly_digest: false,
    psychographic_triggers: {
      high_churn_risk: true,
      motivation_shift: true,
      emotional_state_change: false
    }
  });

  const [privacySettings, setPrivacySettings] = useState({
    allow_psychographic_tracking: true,
    allow_third_party_integrations: true,
    data_retention_days: 90
  });

  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      setProfileData({
        full_name: currentUser.full_name || '',
        email: currentUser.email || ''
      });

      // Load saved preferences
      if (currentUser.notification_preferences) {
        setNotificationPrefs(currentUser.notification_preferences);
      }
      
      if (currentUser.privacy_settings) {
        setPrivacySettings(currentUser.privacy_settings);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        full_name: profileData.full_name
      });
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Could not save profile',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        notification_preferences: notificationPrefs
      });
      
      toast({
        title: 'Preferences Saved',
        description: 'Notification settings updated'
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Could not save preferences',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        privacy_settings: privacySettings
      });
      
      toast({
        title: 'Privacy Settings Saved',
        description: 'Your privacy preferences have been updated'
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Could not save privacy settings',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <PageHeader
          title="User Settings"
          description="Manage your profile, notifications, and privacy preferences"
          icon={User}
          docSection="user-settings"
        />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-[#111111] border border-[#262626] w-full">
            <TabsTrigger value="profile" className="flex-1 data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] data-[state=active]:font-semibold">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] data-[state=active]:font-semibold">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1 data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] data-[state=active]:font-semibold">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-white">
                <div>
                  <label className="text-sm text-[#e5e5e5] mb-2 block">Full Name</label>
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="bg-[#0a0a0a] border-[#262626] text-white placeholder:text-[#6b7280]"
                  />
                </div>

                <div>
                  <label className="text-sm text-[#e5e5e5] mb-2 block">Email</label>
                  <Input
                    value={profileData.email}
                    disabled
                    className="bg-[#0a0a0a] border-[#262626] text-[#6b7280]"
                  />
                  <p className="text-xs text-[#6b7280] mt-1">Email cannot be changed</p>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-white">
                <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                  <div>
                    <p className="text-white font-medium">AI Insights Digest</p>
                    <p className="text-sm text-[#6b7280]">Weekly summary of psychographic insights</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.email_insights}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, email_insights: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Churn Risk Alerts</p>
                    <p className="text-sm text-[#6b7280]">Immediate alerts for high churn risk users</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.email_churn_alerts}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, email_churn_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Weekly Digest</p>
                    <p className="text-sm text-[#6b7280]">Performance summary every Monday</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.email_weekly_digest}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, email_weekly_digest: checked })}
                  />
                </div>

                <div className="pt-4 border-t border-[#262626]">
                  <h4 className="text-white font-semibold mb-3">Psychographic Triggers</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                      <div>
                        <p className="text-white font-medium">High Churn Risk</p>
                        <p className="text-sm text-[#6b7280]">Alert when users enter high churn risk</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.psychographic_triggers.high_churn_risk}
                        onCheckedChange={(checked) => setNotificationPrefs({
                          ...notificationPrefs,
                          psychographic_triggers: {
                            ...notificationPrefs.psychographic_triggers,
                            high_churn_risk: checked
                          }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                      <div>
                        <p className="text-white font-medium">Motivation Shifts</p>
                        <p className="text-sm text-[#6b7280]">Notify when user motivations change significantly</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.psychographic_triggers.motivation_shift}
                        onCheckedChange={(checked) => setNotificationPrefs({
                          ...notificationPrefs,
                          psychographic_triggers: {
                            ...notificationPrefs.psychographic_triggers,
                            motivation_shift: checked
                          }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                      <div>
                        <p className="text-white font-medium">Emotional State Changes</p>
                        <p className="text-sm text-[#6b7280]">Alert on significant emotional state transitions</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.psychographic_triggers.emotional_state_change}
                        onCheckedChange={(checked) => setNotificationPrefs({
                          ...notificationPrefs,
                          psychographic_triggers: {
                            ...notificationPrefs.psychographic_triggers,
                            emotional_state_change: checked
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveNotifications}
                  disabled={isSaving}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Privacy & Data Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-white">
                <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Psychographic Tracking</p>
                    <p className="text-sm text-[#6b7280]">Allow AI to analyze your behavior for personalization</p>
                  </div>
                  <Switch
                    checked={privacySettings.allow_psychographic_tracking}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allow_psychographic_tracking: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Third-Party Integrations</p>
                    <p className="text-sm text-[#6b7280]">Share data with connected platforms (HubSpot, GA4, etc.)</p>
                  </div>
                  <Switch
                    checked={privacySettings.allow_third_party_integrations}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allow_third_party_integrations: checked })}
                  />
                </div>

                <div>
                  <label className="text-sm text-[#a3a3a3] mb-2 block">Data Retention (Days)</label>
                  <Input
                    type="number"
                    min="30"
                    max="730"
                    value={privacySettings.data_retention_days}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, data_retention_days: parseInt(e.target.value) })}
                    className="bg-[#0a0a0a] border-[#262626] text-white"
                  />
                  <p className="text-xs text-[#6b7280] mt-1">How long to keep your psychographic data (30-730 days)</p>
                </div>

                <Button
                  onClick={handleSavePrivacy}
                  disabled={isSaving}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Privacy Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#ef4444]/10 border-[#ef4444]/30">
              <CardHeader>
                <CardTitle className="text-[#ef4444]">Data Deletion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#e5e5e5] mb-4">
                  Request deletion of all your psychographic data. This action cannot be undone and may affect 
                  integrated platforms.
                </p>
                <Button
                  variant="outline"
                  className="border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10"
                >
                  Request Data Deletion
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
