import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, Eye, Brain, Zap, Target, Mail, Bell, 
  ChevronRight, Filter, Calendar
} from 'lucide-react';
import moment from 'moment';

const EVENT_TYPES = {
  profile_analyzed: { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Profile Analyzed' },
  engagement_sent: { icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Engagement Sent' },
  recommendation_generated: { icon: Target, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Recommendation' },
  email_personalized: { icon: Mail, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Email Personalized' },
  notification_sent: { icon: Bell, color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'Notification Sent' },
  data_accessed: { icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Data Accessed' }
};

export default function DataUsageTimeline({ userId, events = [] }) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  // Generate sample timeline if no events provided
  const timelineEvents = events.length > 0 ? events : [
    { type: 'profile_analyzed', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), details: 'Psychographic profile updated based on recent session activity' },
    { type: 'engagement_sent', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), details: 'Personalized check-in delivered based on engagement preferences' },
    { type: 'recommendation_generated', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), details: 'Content recommendations generated using motivation stack' },
    { type: 'email_personalized', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), details: 'Weekly digest customized to your cognitive style' },
    { type: 'data_accessed', timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), details: 'Profile data accessed for audience segmentation' },
    { type: 'profile_analyzed', timestamp: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(), details: 'Emotional state inference updated' }
  ];

  const filteredEvents = filter === 'all' 
    ? timelineEvents 
    : timelineEvents.filter(e => e.type === filter);

  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = moment(event.timestamp).format('YYYY-MM-DD');
    if (!groups[date]) groups[date] = [];
    groups[date].push(event);
    return groups;
  }, {});

  return (
    <Card className="bg-[#111] border-[#262626]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00d4ff]" />
            Data Usage Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6b7280]" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#00d4ff]"
            >
              <option value="all">All Events</option>
              {Object.entries(EVENT_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-[#a3a3a3]">
          See exactly how and when your data was used
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <div key={date} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#6b7280]" />
                <span className="text-sm font-medium text-[#a3a3a3]">
                  {moment(date).calendar(null, {
                    sameDay: '[Today]',
                    lastDay: '[Yesterday]',
                    lastWeek: 'dddd',
                    sameElse: 'MMMM D, YYYY'
                  })}
                </span>
              </div>
              
              <div className="space-y-3 ml-2 border-l-2 border-[#262626] pl-4">
                {dayEvents.map((event, i) => {
                  const config = EVENT_TYPES[event.type] || EVENT_TYPES.data_accessed;
                  const Icon = config.icon;
                  const isExpanded = expanded === `${date}-${i}`;

                  return (
                    <div 
                      key={i}
                      className={`relative p-4 rounded-lg transition-all cursor-pointer ${
                        isExpanded ? 'bg-[#1a1a1a] border border-[#00d4ff]/30' : 'bg-[#0f0f0f] border border-[#262626] hover:border-[#333]'
                      }`}
                      onClick={() => setExpanded(isExpanded ? null : `${date}-${i}`)}
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-[22px] top-5 w-3 h-3 rounded-full ${config.bg} border-2 border-[#111]`} />
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${config.bg}`}>
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{config.label}</span>
                              <span className="text-xs text-[#6b7280]">
                                {moment(event.timestamp).format('h:mm A')}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 ${isExpanded ? 'text-[#a3a3a3]' : 'text-[#6b7280] line-clamp-1'}`}>
                              {event.details}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-[#6b7280] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#262626]">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-[#6b7280]">Event Type</span>
                              <p className="text-white capitalize">{event.type.replace('_', ' ')}</p>
                            </div>
                            <div>
                              <span className="text-[#6b7280]">Timestamp</span>
                              <p className="text-white">{moment(event.timestamp).format('MMM D, YYYY h:mm:ss A')}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-3 rounded bg-[#262626]/50">
                            <span className="text-xs text-[#6b7280]">Purpose</span>
                            <p className="text-sm text-[#a3a3a3] mt-1">
                              This data was used to improve your personalized experience and provide relevant content.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-[#333] mx-auto mb-4" />
              <p className="text-[#6b7280]">No events found</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}