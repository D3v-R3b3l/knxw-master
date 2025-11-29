import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Trash2, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CommandScheduler({ robots }) {
  const [scheduledCommands, setScheduledCommands] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    robot_id: '',
    verb: '',
    args: '{}',
    schedule_type: 'once',
    scheduled_time: '',
    interval_minutes: 60
  });

  const handleScheduleCommand = async () => {
    if (!scheduleConfig.robot_id || !scheduleConfig.verb) {
      toast.error('Please select a robot and enter command verb');
      return;
    }

    try {
      const args = JSON.parse(scheduleConfig.args);
      const newSchedule = {
        id: crypto.randomUUID(),
        robot_id: scheduleConfig.robot_id,
        verb: scheduleConfig.verb,
        args,
        schedule_type: scheduleConfig.schedule_type,
        scheduled_time: scheduleConfig.scheduled_time,
        interval_minutes: scheduleConfig.interval_minutes,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      setScheduledCommands(prev => [...prev, newSchedule]);
      setShowScheduleForm(false);
      setScheduleConfig({
        robot_id: '',
        verb: '',
        args: '{}',
        schedule_type: 'once',
        scheduled_time: '',
        interval_minutes: 60
      });
      toast.success('Command scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule command:', error);
      toast.error('Invalid JSON in arguments');
    }
  };

  const handleExecuteNow = async (schedule) => {
    try {
      const command = {
        command_id: crypto.randomUUID(),
        robot_id: schedule.robot_id,
        trace_id: crypto.randomUUID(),
        verb: schedule.verb,
        args: schedule.args,
        status: 'sent',
        sent_at: new Date().toISOString()
      };

      await base44.entities.RobotCommandLog.create(command);
      toast.success('Command executed immediately');
    } catch (error) {
      console.error('Failed to execute command:', error);
      toast.error('Failed to execute command');
    }
  };

  const handleDeleteSchedule = (scheduleId) => {
    setScheduledCommands(prev => prev.filter(s => s.id !== scheduleId));
    toast.success('Schedule deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Command Scheduler</h3>
        <Button
          onClick={() => setShowScheduleForm(true)}
          className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Command
        </Button>
      </div>

      {showScheduleForm && (
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white">Schedule New Command</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={scheduleConfig.robot_id}
              onValueChange={(value) => setScheduleConfig({ ...scheduleConfig, robot_id: value })}
            >
              <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                <SelectValue placeholder="Select Robot" />
              </SelectTrigger>
              <SelectContent>
                {robots.map(robot => (
                  <SelectItem key={robot.id} value={robot.robot_id}>
                    {robot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Command Verb"
              value={scheduleConfig.verb}
              onChange={(e) => setScheduleConfig({ ...scheduleConfig, verb: e.target.value })}
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />

            <Input
              placeholder="Arguments (JSON)"
              value={scheduleConfig.args}
              onChange={(e) => setScheduleConfig({ ...scheduleConfig, args: e.target.value })}
              className="bg-[#0a0a0a] border-[#262626] text-white font-mono"
            />

            <Select
              value={scheduleConfig.schedule_type}
              onValueChange={(value) => setScheduleConfig({ ...scheduleConfig, schedule_type: value })}
            >
              <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Execute Once</SelectItem>
                <SelectItem value="recurring">Recurring</SelectItem>
              </SelectContent>
            </Select>

            {scheduleConfig.schedule_type === 'once' ? (
              <Input
                type="datetime-local"
                value={scheduleConfig.scheduled_time}
                onChange={(e) => setScheduleConfig({ ...scheduleConfig, scheduled_time: e.target.value })}
                className="bg-[#0a0a0a] border-[#262626] text-white"
              />
            ) : (
              <Input
                type="number"
                placeholder="Interval (minutes)"
                value={scheduleConfig.interval_minutes}
                onChange={(e) => setScheduleConfig({ ...scheduleConfig, interval_minutes: parseInt(e.target.value) })}
                className="bg-[#0a0a0a] border-[#262626] text-white"
              />
            )}

            <div className="flex gap-3">
              <Button onClick={handleScheduleCommand} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] flex-1">
                Schedule
              </Button>
              <Button onClick={() => setShowScheduleForm(false)} variant="outline" className="border-[#262626] text-[#a3a3a3]">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Commands List */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white">Scheduled Commands</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledCommands.length === 0 ? (
            <p className="text-center text-[#a3a3a3] py-8">No scheduled commands</p>
          ) : (
            <div className="space-y-2">
              {scheduledCommands.map(schedule => (
                <div key={schedule.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm text-white font-mono">{schedule.verb}</code>
                      <Badge variant="outline" className="text-xs">{schedule.robot_id}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#a3a3a3]">
                      <span className="flex items-center gap-1">
                        {schedule.schedule_type === 'once' ? <Calendar className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {schedule.schedule_type === 'once' 
                          ? new Date(schedule.scheduled_time).toLocaleString()
                          : `Every ${schedule.interval_minutes}min`
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleExecuteNow(schedule)}
                      className="bg-[#10b981] hover:bg-[#059669] text-white"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Execute Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="border-red-500/30 text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}