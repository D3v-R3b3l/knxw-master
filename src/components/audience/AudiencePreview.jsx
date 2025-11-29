import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Loader2, Users, UserCheck } from "lucide-react";

export default function AudiencePreview({ data, isLoading, onSave, isSaving, hasConditions, segmentName, editingSegment }) {
  return (
    <div className="space-y-6 sticky top-6">
      {/* Preview Card */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#00d4ff]" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasConditions ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-[#a3a3a3] opacity-50" />
              <p className="text-[#a3a3a3] text-sm">Add filters to see preview</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto mb-4 text-[#00d4ff] animate-spin" />
              <p className="text-[#a3a3a3] text-sm">Calculating audience...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Count */}
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-white mb-1">
                  {data.count.toLocaleString()}
                </div>
                <div className="text-sm text-[#a3a3a3]">
                  matching users
                </div>
              </div>

              {/* Sample Users */}
              {data.sampleUsers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#a3a3a3] mb-3">Sample Users:</h4>
                  <div className="space-y-2">
                    {data.sampleUsers.map((user, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-[#262626]"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3 h-3 text-[#00d4ff]" />
                          <span className="text-sm font-mono text-white">{user.id}</span>
                        </div>
                        <div className="flex gap-1">
                          <Badge className="text-xs bg-[#fbbf24]/20 text-[#fbbf24]">
                            {user.riskProfile}
                          </Badge>
                          <Badge className="text-xs bg-[#ec4899]/20 text-[#ec4899]">
                            {user.cognitiveStyle}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Card */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Save className="w-5 h-5 text-[#00d4ff]" />
            {editingSegment ? "Update Segment" : "Save Segment"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={onSave}
            disabled={!hasConditions || !segmentName.trim() || isSaving || isLoading}
            className="w-full bg-[#00d4ff] text-[#0a0a0a] hover:bg-[#0ea5e9] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {editingSegment ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {editingSegment ? "Update Segment" : "Save Segment"}
              </>
            )}
          </Button>

          {editingSegment && (
            <p className="text-xs text-[#a3a3a3] mt-2 text-center">
              You are editing "{editingSegment.name}"
            </p>
          )}

          <div className="mt-4 text-xs text-[#6b7280] space-y-1">
            <p>• Segments can be reused across campaigns</p>
            <p>• Preview updates automatically as you edit</p>
            <p>• Saved segments include current size estimate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}