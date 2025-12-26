import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Store, Search, Star, TrendingUp, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '../components/ui/PageHeader';

export default function EngagementMarketplace() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, [categoryFilter, industryFilter]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const query = {};
      if (categoryFilter !== 'all') query.category = categoryFilter;
      if (industryFilter !== 'all') query.industry = industryFilter;

      const data = await base44.entities.EngagementRuleTemplate.filter(query, '-created_date', 50);
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading templates',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const cloneTemplate = async (template) => {
    try {
      // Clone the engagement rule
      const rule = await base44.entities.EngagementRule.create({
        ...template.rule_config,
        name: `${template.template_name} (Cloned)`,
        status: 'inactive'
      });

      // Clone the engagement template if exists
      if (template.engagement_template_config) {
        await base44.entities.EngagementTemplate.create({
          ...template.engagement_template_config,
          name: `${template.template_name} Template (Cloned)`
        });
      }

      // Update usage count
      await base44.entities.EngagementRuleTemplate.update(template.id, {
        performance_stats: {
          ...template.performance_stats,
          usage_count: (template.performance_stats?.usage_count || 0) + 1
        }
      });

      toast({
        variant: 'success',
        title: 'Template Cloned',
        description: 'The engagement template has been added to your account. You can customize it in the Engagements section.'
      });
    } catch (error) {
      console.error('Error cloning template:', error);
      toast({
        variant: 'destructive',
        title: 'Error cloning template',
        description: error.message
      });
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCategoryColor = (category) => {
    const colors = {
      onboarding: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      retention: 'bg-green-500/20 text-green-400 border-green-500/30',
      conversion: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      support: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      upsell: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      reactivation: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Engagement Marketplace"
          description="Pre-built engagement rules and templates tailored for specific industries and use cases"
          icon={Store}
          docSection="engagement-marketplace"
        />

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111111] border-[#262626] text-white"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-[#111111] border-[#262626] text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="retention">Retention</SelectItem>
              <SelectItem value="conversion">Conversion</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="upsell">Upsell</SelectItem>
              <SelectItem value="reactivation">Reactivation</SelectItem>
            </SelectContent>
          </Select>
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="bg-[#111111] border-[#262626] text-white">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="e-commerce">E-commerce</SelectItem>
              <SelectItem value="SaaS">SaaS</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="education">Education</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto" />
            <p className="text-[#a3a3a3] mt-4">Loading marketplace...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-12 text-center">
              <Store className="w-16 h-16 text-[#a3a3a3] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Templates Found</h3>
              <p className="text-[#a3a3a3]">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/40 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg text-white">{template.template_name}</CardTitle>
                    {template.is_official && (
                      <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Official
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className="text-[#a3a3a3] border-[#262626]">
                      {template.industry}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#a3a3a3] mb-4 line-clamp-3">
                    {template.description}
                  </CardDescription>

                  {template.performance_stats && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#262626]">
                        <div className="text-xs text-[#6b7280] mb-1">Conversion Rate</div>
                        <div className="text-lg font-bold text-white">
                          {((template.performance_stats.avg_conversion_rate || 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#262626]">
                        <div className="text-xs text-[#6b7280] mb-1">Used By</div>
                        <div className="text-lg font-bold text-white">
                          {template.performance_stats.usage_count || 0}
                        </div>
                      </div>
                    </div>
                  )}

                  {template.tags && template.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-4">
                      {template.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-[#1a1a1a] text-[#a3a3a3] border-[#262626]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => cloneTemplate(template)}
                    className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}