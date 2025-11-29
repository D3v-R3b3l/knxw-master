import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertRule, AlertChannel, Alert } from "@/entities/all";
import { Bell, Plus, Trash2, Mail, MessageSquare, Smartphone, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function AlertsManager() {
  const [rules, setRules] = React.useState([]);
  const [channels, setChannels] = React.useState([]);
  const [alerts, setAlerts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [newChannelType, setNewChannelType] = React.useState("");
  const [newChannelName, setNewChannelName] = React.useState("");
  const [newChannelConfig, setNewChannelConfig] = React.useState("");

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesData, channelsData, alertsData] = await Promise.all([
        AlertRule.list(),
        AlertChannel.list(),
        Alert.list('-created_date', 50)
      ]);
      setRules(rulesData);
      setChannels(channelsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load alerts data:', error);
    }
    setLoading(false);
  };

  const toggleRule = async (ruleId, enabled) => {
    try {
      await AlertRule.update(ruleId, { enabled });
      loadData();
    } catch (error) {
      console.error('Failed to update rule:', error);
    }
  };

  const createChannel = async () => {
    if (!newChannelType || !newChannelName || !newChannelConfig) return;

    try {
      let config = {};
      if (newChannelType === 'email') {
        config.email_addresses = newChannelConfig.split(',').map(e => e.trim());
      } else if (newChannelType === 'slack') {
        config.slack_webhook_url = newChannelConfig.trim();
      } else if (newChannelType === 'sms') {
        config.phone_numbers = newChannelConfig.split(',').map(p => p.trim());
      }

      await AlertChannel.create({
        channel_type: newChannelType,
        name: newChannelName,
        config: config
      });

      setNewChannelType("");
      setNewChannelName("");
      setNewChannelConfig("");
      loadData();
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  const deleteChannel = async (channelId) => {
    if (!confirm('Are you sure you want to delete this notification channel?')) return;
    
    try {
      await AlertChannel.delete(channelId);
      loadData();
    } catch (error) {
      console.error('Failed to delete channel:', error);
    }
  };

  const getChannelIcon = (type) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'slack': return <MessageSquare className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="w-5 h-5 text-[#00d4ff]" />
            Alert Management
          </CardTitle>
          <CardDescription className="text-[#a3a3a3]">
            Configure alert rules and notification channels for your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Tabs defaultValue="rules" className="space-y-4">
            <TabsList className="bg-[#0f0f0f] border border-[#262626]">
              <TabsTrigger value="rules" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                Alert Rules ({rules.length})
              </TabsTrigger>
              <TabsTrigger value="channels" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                Notification Channels ({channels.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                Alert History ({alerts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-4">
              {rules.length === 0 ? (
                <div className="text-center text-[#a3a3a3] py-8">
                  No alert rules configured yet.
                </div>
              ) : (
                rules.map((rule) => (
                  <div key={rule.id} className="p-4 bg-[#0f0f0f] border border-[#262626] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{rule.rule_name.replace(/_/g, ' ').toUpperCase()}</h4>
                        <p className="text-sm text-[#a3a3a3] mt-1">
                          Window: {rule.time_window_minutes}min | Cooldown: {rule.cooldown_minutes}min
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${rule.enabled ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' : 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'}`}>
                          {rule.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(enabled) => toggleRule(rule.id, enabled)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="channels" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-[#0f0f0f] border border-[#262626] rounded-lg">
                <Select value={newChannelType} onValueChange={setNewChannelType}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                    <SelectValue placeholder="Channel Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Channel name"
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                />
                <Input
                  value={newChannelConfig}
                  onChange={(e) => setNewChannelConfig(e.target.value)}
                  placeholder={
                    newChannelType === 'email' ? 'email1@example.com, email2@example.com' :
                    newChannelType === 'slack' ? 'https://hooks.slack.com/...' :
                    newChannelType === 'sms' ? '+1234567890, +0987654321' :
                    'Configuration'
                  }
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                />
                <Button
                  onClick={createChannel}
                  disabled={!newChannelType || !newChannelName || !newChannelConfig}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {channels.map((channel) => (
                <div key={channel.id} className="p-4 bg-[#0f0f0f] border border-[#262626] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getChannelIcon(channel.channel_type)}
                      <div>
                        <h4 className="text-white font-medium">{channel.name}</h4>
                        <p className="text-sm text-[#a3a3a3] capitalize">{channel.channel_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${channel.enabled ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' : 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'}`}>
                        {channel.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteChannel(channel.id)}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center text-[#a3a3a3] py-8">
                  No alerts in history yet.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-[#0f0f0f] border border-[#262626] rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.severity)}
                        <div>
                          <h4 className="text-white font-medium">{alert.title}</h4>
                          <p className="text-sm text-[#a3a3a3] mt-1">{alert.message}</p>
                          <p className="text-xs text-[#6b7280] mt-2">
                            {new Date(alert.created_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={`${
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          alert.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {alert.severity}
                        </Badge>
                        <Badge className={`${
                          alert.status === 'resolved' ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' :
                          alert.status === 'acknowledged' ? 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30' :
                          'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                        }`}>
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}