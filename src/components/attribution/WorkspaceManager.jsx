import React, { useState } from 'react';
import { Workspace } from '@/entities/Workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Server } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function WorkspaceManager({ workspaces, setWorkspaces, selectedWorkspace, onSelectWorkspace }) {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!newWorkspaceName.trim()) {
      toast({ title: "Workspace name is required.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const newWs = await Workspace.create({ name: newWorkspaceName.trim(), default_timezone: "UTC" });
      setWorkspaces(prev => [...prev, newWs]);
      setNewWorkspaceName('');
      onSelectWorkspace(newWs.id);
      toast({ title: "Workspace created!", variant: "success" });
    } catch (e) {
      toast({ title: "Failed to create workspace", description: e.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="space-y-2">
        {workspaces.map(ws => (
          <button
            key={ws.id}
            onClick={() => onSelectWorkspace(ws.id)}
            className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 transition-colors ${
              selectedWorkspace === ws.id
                ? 'bg-[#00d4ff]/10 border-[#00d4ff]/50'
                : 'bg-[#1a1a1a] border-[#262626] hover:bg-[#202020]'
            }`}
          >
            <Server className="w-4 h-4 text-[#a3a3a3]" />
            <span className="font-medium text-white">{ws.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Input
          placeholder="New Workspace Name..."
          value={newWorkspaceName}
          onChange={e => setNewWorkspaceName(e.target.value)}
          className="bg-[#1a1a1a] border-[#262626] text-white"
        />
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span className="ml-2 hidden sm:inline">Create</span>
        </Button>
      </div>
    </div>
  );
}