import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import AnimatedBar from '@/components/charts/AnimatedBar';

export default function FleetMonitor({ robots, commandLogs }) {
  const fleetStats = {
    online: robots.filter(r => r.status === 'online').length,
    offline: robots.filter(r => r.status === 'offline').length,
    error: robots.filter(r => r.status === 'error').length,
    total: robots.length
  };

  const robotPerformance = robots.map(robot => {
    const robotCommands = commandLogs.filter(c => c.robot_id === robot.robot_id);
    const successful = robotCommands.filter(c => c.status === 'acked_completed').length;
    const failed = robotCommands.filter(c => c.status === 'acked_failed' || c.status === 'policy_violation').length;
    
    return {
      name: robot.name.substring(0, 12),
      Success: successful,
      Failed: failed,
      status: robot.status
    };
  });

  return (
    <div className="space-y-6">
      {/* Fleet Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a3a3a3] mb-1">Total Fleet</p>
                <p className="text-3xl font-bold text-white">{fleetStats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-[#00d4ff] opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a3a3a3] mb-1">Online</p>
                <p className="text-3xl font-bold text-[#10b981]">{fleetStats.online}</p>
              </div>
              <Wifi className="w-8 h-8 text-[#10b981] opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a3a3a3] mb-1">Offline</p>
                <p className="text-3xl font-bold text-[#6b7280]">{fleetStats.offline}</p>
              </div>
              <WifiOff className="w-8 h-8 text-[#6b7280] opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a3a3a3] mb-1">Errors</p>
                <p className="text-3xl font-bold text-[#ef4444]">{fleetStats.error}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-[#ef4444] opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Performance Chart */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white">Fleet Command Performance</CardTitle>
          <p className="text-sm text-[#a3a3a3]">Success vs failure rates across all robots</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <AnimatedBar 
              data={robotPerformance} 
              bars={[
                { key: 'Success', color: '#10b981', name: 'Success', stack: 'total' },
                { key: 'Failed', color: '#ef4444', name: 'Failed', stack: 'total' }
              ]} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Robot Status List */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white">Fleet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {robots.map(robot => (
              <div key={robot.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    robot.status === 'online' ? 'bg-[#10b981] animate-pulse' :
                    robot.status === 'error' ? 'bg-[#ef4444]' :
                    'bg-[#6b7280]'
                  }`} />
                  <span className="text-white font-medium">{robot.name}</span>
                  <code className="text-xs text-[#a3a3a3] font-mono">{robot.robot_id}</code>
                </div>
                <Badge className={
                  robot.status === 'online' ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' :
                  robot.status === 'error' ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30' :
                  'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'
                }>
                  {robot.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}