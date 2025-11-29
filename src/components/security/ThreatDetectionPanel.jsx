import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Activity, 
  Lock, 
  Zap,
  Clock,
  Globe,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { useSecurity } from './SecurityProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function ThreatDetectionPanel() {
  const { 
    threatLevel, 
    securityEvents, 
    cspViolations, 
    metrics, 
    sessionValid,
    actions 
  } = useSecurity();
  
  const [showDetailedEvents, setShowDetailedEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getThreatLevelColor = (level) => {
    const colors = {
      low: 'text-green-400 bg-green-400/10 border-green-400/20',
      medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      critical: 'text-red-400 bg-red-400/10 border-red-400/20'
    };
    return colors[level] || colors.low;
  };

  const getThreatLevelIcon = (level) => {
    const icons = {
      low: Shield,
      medium: Eye,
      high: AlertTriangle,
      critical: Zap
    };
    const IconComponent = icons[level] || Shield;
    return <IconComponent className="w-4 h-4" />;
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      suspicious_network_request: Globe,
      suspicious_dom_attribute: Terminal,
      suspicious_script_injection: AlertTriangle,
      suspicious_iframe_injection: AlertTriangle,
      csp_violation: Shield,
      suspicious_console_error: Activity,
      session_expired: Lock,
      failed_permission_check: Eye
    };
    const IconComponent = icons[type] || Activity;
    return <IconComponent className="w-4 h-4" />;
  };

  const recentEvents = securityEvents.slice(-10).reverse();

  return (
    <div className="space-y-6">
      {/* Threat Level Overview */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-[#00d4ff]" />
            Security Threat Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getThreatLevelColor(threatLevel)}`}>
              {getThreatLevelIcon(threatLevel)}
              <span className="font-semibold capitalize">{threatLevel}</span>
            </div>
            
            <Button
              onClick={actions.refreshPermissions}
              variant="outline"
              size="sm"
              className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {!sessionValid && (
            <Alert className="border-red-500/20 bg-red-500/5">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                Session validation failed. Please re-authenticate immediately.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm text-[#a3a3a3]">Security Events</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {securityEvents.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#10b981]" />
              <span className="text-sm text-[#a3a3a3]">CSP Violations</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {cspViolations.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-[#fbbf24]" />
              <span className="text-sm text-[#a3a3a3]">Login Attempts</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.loginAttempts}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
              <span className="text-sm text-[#a3a3a3]">Suspicious Activity</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.suspiciousActivity}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-[#00d4ff]" />
              Recent Security Events
            </CardTitle>
            
            <Button
              onClick={() => setShowDetailedEvents(!showDetailedEvents)}
              variant="outline"
              size="sm"
              className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]"
            >
              {showDetailedEvents ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center py-8 text-[#6b7280]">
              <Shield className="w-12 h-12 text-[#6b7280] mx-auto mb-4 opacity-50" />
              <p>No security events detected</p>
              <p className="text-sm mt-2">System is operating normally</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {recentEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#262626] hover:border-[#00d4ff]/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex-shrink-0">
                      {getEventTypeIcon(event.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">
                          {event.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <Badge 
                          variant="outline" 
                          className="text-xs border-[#00d4ff]/30 text-[#00d4ff]"
                        >
                          {format(new Date(event.timestamp), 'HH:mm:ss')}
                        </Badge>
                      </div>
                      
                      {showDetailedEvents && (
                        <div className="text-xs text-[#a3a3a3]">
                          {event.details?.url && (
                            <div className="truncate">URL: {event.details.url}</div>
                          )}
                          {event.details?.message && (
                            <div className="truncate">Message: {event.details.message}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <Clock className="w-4 h-4 text-[#6b7280]" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSP Violations */}
      {cspViolations.length > 0 && (
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-[#ef4444]" />
              Content Security Policy Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cspViolations.slice(-5).map((violation, index) => (
                <div key={index} className="p-3 bg-[#1a1a1a] rounded-lg border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-red-400 text-sm">
                      {violation.violatedDirective}
                    </span>
                    <span className="text-xs text-[#6b7280]">
                      {format(new Date(violation.timestamp), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <div className="text-xs text-[#a3a3a3] space-y-1">
                    {violation.blockedURI && (
                      <div className="truncate">Blocked: {violation.blockedURI}</div>
                    )}
                    <div>Disposition: {violation.disposition}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111111] rounded-lg border border-[#262626] p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Security Event Details
              </h3>
              <Button
                onClick={() => setSelectedEvent(null)}
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#a3a3a3]">Event Type</label>
                <div className="text-white">{selectedEvent.type}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#a3a3a3]">Timestamp</label>
                <div className="text-white">
                  {format(new Date(selectedEvent.timestamp), 'PPpp')}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#a3a3a3]">Details</label>
                <pre className="bg-[#1a1a1a] p-3 rounded text-sm text-white overflow-auto">
                  {JSON.stringify(selectedEvent.details, null, 2)}
                </pre>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#a3a3a3]">User Agent</label>
                <div className="text-white text-sm break-all">
                  {selectedEvent.userAgent}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}