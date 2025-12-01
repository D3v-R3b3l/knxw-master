import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, User, Activity, ExternalLink, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function JourneyTestDialog({ isOpen, onClose, onRun }) {
  const [userId, setUserId] = useState("");
  const [eventType, setEventType] = useState("page_view");
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchRecentUsers();
    }
  }, [isOpen]);

  const fetchRecentUsers = async () => {
    try {
      const profiles = await base44.entities.UserPsychographicProfile.list('-last_analyzed', 5);
      if (profiles && profiles.length > 0) {
        setRecentUsers(profiles.map(p => p.user_id));
      }
    } catch (error) {
      console.error("Failed to fetch recent users", error);
    }
  };

  const handleSubmit = () => {
    if (userId && eventType) {
      onRun(userId, eventType);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00d4ff]" />
            Test Journey
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-[#9ca3af] hover:text-white hover:bg-[#333]">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[#e5e5e5]">User ID</label>
                <a href={createPageUrl('Profiles')} target="_blank" rel="noreferrer" className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1">
                    Find User <ExternalLink className="w-3 h-3" />
                </a>
            </div>
            
            <div className="relative">
              <Input
                placeholder="Enter user_id..."
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="bg-[#333] border-[#555] text-white pr-10 focus:border-[#00d4ff]"
              />
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            </div>
            
            {recentUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {recentUsers.map((uid) => (
                  <button
                    key={uid}
                    onClick={() => setUserId(uid)}
                    className="text-xs bg-[#333] hover:bg-[#444] text-[#9ca3af] hover:text-white px-2 py-1 rounded border border-[#444] transition-colors max-w-[100px] truncate"
                  >
                    {uid}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Event Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#e5e5e5]">Event Type</label>
            <div className="relative">
                <Input
                    placeholder="e.g. page_view"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="bg-[#333] border-[#555] text-white pr-10 focus:border-[#00d4ff]"
                />
                <Zap className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {['page_view', 'user_signup', 'purchase', 'trial_started'].map(type => (
                    <button
                        key={type}
                        onClick={() => setEventType(type)}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${
                            eventType === type 
                            ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]' 
                            : 'bg-[#333] border-[#444] text-[#9ca3af] hover:bg-[#444] hover:text-white'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-[#a3a3a3] hover:text-white hover:bg-[#333]">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!userId || !eventType} className="bg-[#00d4ff] text-[#0a0a0a] hover:bg-[#0ea5e9]">
            Run Test
          </Button>
        </div>
      </div>
    </div>
  );
}