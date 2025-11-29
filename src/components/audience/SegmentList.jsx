import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, Calendar, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function SegmentList({ segments, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i} className="bg-[#111111] border-[#262626] animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-[#262626] rounded mb-2 w-1/3"></div>
              <div className="h-4 bg-[#262626] rounded mb-4 w-2/3"></div>
              <div className="flex gap-2">
                <div className="h-5 bg-[#262626] rounded w-16"></div>
                <div className="h-5 bg-[#262626] rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto mb-4 text-[#a3a3a3] opacity-50" />
        <h3 className="text-lg font-semibold text-white mb-2">No Segments Found</h3>
        <p className="text-[#a3a3a3] mb-4">
          Create your first audience segment to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {segments.map((segment) => (
        <Card key={segment.id} className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {segment.name}
                  </h3>
                  <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {segment.estimated_size?.toLocaleString() || "0"}
                  </Badge>
                </div>

                {segment.description && (
                  <p className="text-[#a3a3a3] mb-3">
                    {segment.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="text-xs border-[#262626] text-[#a3a3a3]">
                    {segment.filter_conditions?.conditions?.length || 0} conditions
                  </Badge>
                  
                  {segment.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-[#262626] text-[#a3a3a3]">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created {formatDistanceToNow(new Date(segment.created_date), { addSuffix: true })}
                  </div>
                  
                  {segment.last_calculated && (
                    <div>
                      Size updated {formatDistanceToNow(new Date(segment.last_calculated), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(segment)}
                  className="text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(segment)}
                  className="text-[#ef4444] hover:text-[#dc2626] hover:bg-[#ef4444]/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}