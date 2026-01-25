import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FilterBuilder from '../components/audience/FilterBuilder';
import AudiencePreview from '../components/audience/AudiencePreview';
import { useDashboardStore } from '../components/dashboard/DashboardStore';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '../components/ui/PageHeader';

export default function AudienceBuilder() {
  const { selectedAppId } = useDashboardStore();
  const { toast } = useToast();
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  const [filters, setFilters] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!segmentName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please provide a segment name'
      });
      return;
    }

    setIsSaving(true);
    try {
      await base44.entities.AudienceSegment.create({
        name: segmentName,
        description: segmentDescription,
        client_app_id: selectedAppId,
        filters,
        is_dynamic: true
      });

      toast({
        variant: 'success',
        title: 'Segment Saved',
        description: `"${segmentName}" has been created successfully`
      });

      setSegmentName('');
      setSegmentDescription('');
      setFilters({});
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    toast({
      title: 'Export Started',
      description: 'Preparing audience data for export...'
    });
    // Export logic would go here
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Audience Builder"
          description="Create custom audience segments based on psychographic and behavioral data"
          icon={Users}
        />

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <div className="space-y-6">
            <Card className="bg-[#111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Segment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-[#a3a3a3] mb-2 block">Segment Name</label>
                  <Input
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    placeholder="e.g., High-Value Risk Takers"
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#a3a3a3] mb-2 block">Description</label>
                  <Input
                    value={segmentDescription}
                    onChange={(e) => setSegmentDescription(e.target.value)}
                    placeholder="Brief description of this audience"
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Configure Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <FilterBuilder filters={filters} onChange={setFilters} />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Segment'}
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                className="border-[#262626] hover:bg-[#1a1a1a]"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div>
            <AudiencePreview filters={filters} clientAppId={selectedAppId} />
          </div>
        </div>
      </div>
    </div>
  );
}