import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sliders, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDashboardStore } from '../components/dashboard/DashboardStore';
import PageHeader from '../components/ui/PageHeader';

export default function CustomDimensions() {
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDimension, setEditingDimension] = useState(null);
  const { selectedAppId } = useDashboardStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    dimension_name: '',
    dimension_type: 'numeric',
    industry: '',
    description: '',
    calculation_logic: {
      input_events: [],
      weighting_formula: '',
      min_value: 0,
      max_value: 1
    },
    active: true
  });

  useEffect(() => {
    if (selectedAppId) {
      loadDimensions();
    }
  }, [selectedAppId]);

  const loadDimensions = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.CustomPsychographicDimension.filter({
        client_app_id: selectedAppId
      }, '-created_date', 50);
      setDimensions(data);
    } catch (error) {
      console.error('Error loading dimensions:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading dimensions',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDimension = async () => {
    try {
      const dimensionData = {
        ...formData,
        client_app_id: selectedAppId
      };

      if (editingDimension) {
        await base44.entities.CustomPsychographicDimension.update(editingDimension.id, dimensionData);
        toast({
          variant: 'success',
          title: 'Dimension Updated',
          description: 'Custom psychographic dimension updated successfully'
        });
      } else {
        await base44.entities.CustomPsychographicDimension.create(dimensionData);
        toast({
          variant: 'success',
          title: 'Dimension Created',
          description: 'Custom psychographic dimension created successfully'
        });
      }

      setShowForm(false);
      setEditingDimension(null);
      resetForm();
      loadDimensions();
    } catch (error) {
      console.error('Error saving dimension:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving dimension',
        description: error.message
      });
    }
  };

  const deleteDimension = async (id) => {
    if (!confirm('Are you sure you want to delete this dimension?')) return;
    
    try {
      await base44.entities.CustomPsychographicDimension.delete(id);
      toast({
        variant: 'success',
        title: 'Dimension Deleted',
        description: 'Custom dimension removed successfully'
      });
      loadDimensions();
    } catch (error) {
      console.error('Error deleting dimension:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting dimension',
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setFormData({
      dimension_name: '',
      dimension_type: 'numeric',
      industry: '',
      description: '',
      calculation_logic: {
        input_events: [],
        weighting_formula: '',
        min_value: 0,
        max_value: 1
      },
      active: true
    });
  };

  const editDimension = (dimension) => {
    setEditingDimension(dimension);
    setFormData(dimension);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Custom Psychographic Dimensions"
          description="Define industry-specific traits and dimensions for deeper user understanding"
          icon={Sliders}
          docSection="custom-dimensions"
          actions={
            <Button
              onClick={() => {
                resetForm();
                setEditingDimension(null);
                setShowForm(!showForm);
              }}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Dimension
            </Button>
          }
        />

        {showForm && (
          <Card className="bg-[#111111] border-[#262626] mb-8">
            <CardHeader>
              <CardTitle className="text-white">
                {editingDimension ? 'Edit Dimension' : 'Create New Dimension'}
              </CardTitle>
              <CardDescription className="text-[#a3a3a3]">
                Define a custom psychographic dimension for your industry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Dimension Name</Label>
                <Input
                  placeholder="e.g., Brand Affinity, Price Sensitivity"
                  value={formData.dimension_name}
                  onChange={(e) => setFormData({...formData, dimension_name: e.target.value})}
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Dimension Type</Label>
                  <Select value={formData.dimension_type} onValueChange={(v) => setFormData({...formData, dimension_type: v})}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="numeric">Numeric (0-1)</SelectItem>
                      <SelectItem value="categorical">Categorical</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Industry</Label>
                  <Input
                    placeholder="e.g., e-commerce, healthcare"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Description</Label>
                <Textarea
                  placeholder="What does this dimension measure?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                <div>
                  <Label className="text-white">Active</Label>
                  <p className="text-sm text-[#a3a3a3]">Enable calculation for this dimension</p>
                </div>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={saveDimension} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                  {editingDimension ? 'Update Dimension' : 'Create Dimension'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingDimension(null);
                  resetForm();
                }} className="border-[#262626] text-white hover:bg-[#1a1a1a]">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto" />
            <p className="text-[#a3a3a3] mt-4">Loading dimensions...</p>
          </div>
        ) : dimensions.length === 0 ? (
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-12 text-center">
              <Sliders className="w-16 h-16 text-[#a3a3a3] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Custom Dimensions Yet</h3>
              <p className="text-[#a3a3a3] mb-6">Create industry-specific psychographic dimensions to gain deeper insights</p>
              <Button onClick={() => setShowForm(true)} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Dimension
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {dimensions.map((dimension) => (
              <Card key={dimension.id} className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white mb-2">{dimension.dimension_name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">
                          {dimension.dimension_type}
                        </Badge>
                        <Badge variant="outline" className="text-[#a3a3a3] border-[#262626]">
                          {dimension.industry}
                        </Badge>
                        {dimension.active && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editDimension(dimension)}
                        className="text-[#00d4ff] hover:bg-[#00d4ff]/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDimension(dimension.id)}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#a3a3a3]">
                    {dimension.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}