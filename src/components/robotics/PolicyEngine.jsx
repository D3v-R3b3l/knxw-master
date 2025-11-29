import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PolicyEngine() {
  const [policies, setPolicies] = useState([
    {
      id: '1',
      name: 'Speed Limit',
      rule: 'speed <= 5.0',
      enabled: true,
      violations: 0
    },
    {
      id: '2',
      name: 'Safe Zone Boundary',
      rule: '0 <= x <= 100 AND 0 <= y <= 100',
      enabled: true,
      violations: 2
    },
    {
      id: '3',
      name: 'Battery Threshold',
      rule: 'battery_level >= 15',
      enabled: true,
      violations: 1
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ name: '', rule: '' });

  const handleAddPolicy = () => {
    if (!newPolicy.name.trim() || !newPolicy.rule.trim()) {
      toast.error('Please enter policy name and rule');
      return;
    }

    setPolicies(prev => [...prev, {
      id: Date.now().toString(),
      name: newPolicy.name,
      rule: newPolicy.rule,
      enabled: true,
      violations: 0
    }]);

    setNewPolicy({ name: '', rule: '' });
    setShowAddForm(false);
    toast.success('Policy added successfully');
  };

  const togglePolicy = (policyId) => {
    setPolicies(prev => prev.map(p => 
      p.id === policyId ? { ...p, enabled: !p.enabled } : p
    ));
    toast.success('Policy updated');
  };

  const deletePolicy = (policyId) => {
    setPolicies(prev => prev.filter(p => p.id !== policyId));
    toast.success('Policy deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#fbbf24]" />
            Policy Engine
          </h3>
          <p className="text-sm text-[#a3a3a3] mt-1">
            Define safety rules and operational constraints for your robot fleet
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Policy
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white">Create New Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Policy Name (e.g., Maximum Speed)"
              value={newPolicy.name}
              onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
            <Input
              placeholder="Rule Expression (e.g., speed <= 5.0)"
              value={newPolicy.rule}
              onChange={(e) => setNewPolicy({ ...newPolicy, rule: e.target.value })}
              className="bg-[#0a0a0a] border-[#262626] text-white font-mono"
            />
            <div className="flex gap-3">
              <Button onClick={handleAddPolicy} className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a] flex-1">
                Add Policy
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" className="border-[#262626] text-[#a3a3a3]">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policies List */}
      <div className="grid md:grid-cols-2 gap-4">
        {policies.map(policy => (
          <Card key={policy.id} className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-semibold">{policy.name}</h4>
                    {policy.enabled ? (
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#6b7280]" />
                    )}
                  </div>
                  <code className="text-xs text-[#00d4ff] font-mono bg-[#0a0a0a] px-2 py-1 rounded">
                    {policy.rule}
                  </code>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-[#a3a3a3]">Violations</span>
                <Badge className={
                  policy.violations === 0 ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' :
                  policy.violations < 5 ? 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30' :
                  'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                }>
                  {policy.violations}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => togglePolicy(policy.id)}
                  className={`flex-1 ${
                    policy.enabled 
                      ? 'border-[#10b981]/30 text-[#10b981]' 
                      : 'border-[#262626] text-[#6b7280]'
                  }`}
                >
                  {policy.enabled ? 'Enabled' : 'Disabled'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deletePolicy(policy.id)}
                  className="border-red-500/30 text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {policies.length === 0 && !showAddForm && (
        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-12 text-center">
            <Shield className="w-12 h-12 text-[#404040] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Policies Configured</h3>
            <p className="text-[#a3a3a3] mb-6">
              Create safety policies to automatically validate commands before execution
            </p>
            <Button onClick={() => setShowAddForm(true)} className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a]">
              <Plus className="w-4 h-4 mr-2" />
              Create First Policy
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}