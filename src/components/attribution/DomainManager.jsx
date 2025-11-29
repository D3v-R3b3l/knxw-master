import React, { useState, useEffect, useCallback } from 'react';
import { WorkspaceDomain } from '@/entities/WorkspaceDomain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function DomainManager({ workspaceId }) {
  const [domains, setDomains] = useState([]);
  const [newOrigin, setNewOrigin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchDomains = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const results = await WorkspaceDomain.filter({ workspace_id: workspaceId });
      setDomains(results);
    } catch (e) {
      toast({ title: "Failed to load domains", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, toast]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleAddDomain = async () => {
    if (!newOrigin.trim()) {
      toast({ title: "Origin cannot be empty", variant: "destructive" });
      return;
    }
    // Basic URL validation
    try {
        new URL(newOrigin);
    } catch (_) {
        toast({ title: "Invalid URL format", description: "Please enter a full origin, e.g., https://www.example.com", variant: "destructive" });
        return;
    }
    setIsCreating(true);
    try {
      const newDomain = await WorkspaceDomain.create({ workspace_id: workspaceId, origin: newOrigin.trim() });
      setDomains(prev => [...prev, newDomain]);
      setNewOrigin('');
      toast({ title: "Domain added!", variant: "success" });
    } catch (e) {
      toast({ title: "Failed to add domain", description: e.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDomain = async (domainId) => {
    if (window.confirm("Are you sure you want to remove this domain?")) {
        try {
          await WorkspaceDomain.delete(domainId);
          setDomains(prev => prev.filter(d => d.id !== domainId));
          toast({ title: "Domain removed!", variant: "success" });
        } catch (e) {
          toast({ title: "Failed to remove domain", description: e.message, variant: "destructive" });
        }
    }
  };

  if (!workspaceId) {
    return <p className="text-sm text-[#a3a3a3]">Select a workspace to manage its domains.</p>;
  }
  
  if (isLoading) {
    return <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {domains.map(d => (
          <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
            <span className="font-mono text-sm text-white">{d.origin}</span>
            <Button size="icon" variant="ghost" onClick={() => handleDeleteDomain(d.id)} className="text-red-400 hover:bg-red-500/10 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {domains.length === 0 && <p className="text-xs text-center text-[#a3a3a3] py-4">No authorized domains yet.</p>}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="https://www.your-website.com"
          value={newOrigin}
          onChange={e => setNewOrigin(e.target.value)}
          className="bg-[#1a1a1a] border-[#262626] text-white"
        />
        <Button onClick={handleAddDomain} disabled={isCreating}>
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span className="ml-2 hidden sm:inline">Add Domain</span>
        </Button>
      </div>
    </div>
  );
}