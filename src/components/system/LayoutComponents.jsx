import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { User as UserEntity } from '@/entities/User';

export function ProfileMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    UserEntity.me().then(setUser).catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      navigate('/pages/Landing');
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/pages/Landing';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2 hover:bg-[#1a1a1a]">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.full_name || 'Loading...'}
            </div>
            <div className="text-xs text-[#6b7280] truncate">
              {user?.email || ''}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-[#111111] border-[#262626]">
        <DropdownMenuItem onClick={() => navigate('/pages/Profile')} className="cursor-pointer text-white hover:bg-[#1a1a1a]">
          <User className="w-4 h-4 mr-2" />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/pages/Settings')} className="cursor-pointer text-white hover:bg-[#1a1a1a]">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#262626]" />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-[#ef4444] hover:bg-[#ef4444]/10">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GlobalAIHelpPanelLocal({ currentPageName, isLandingPage, isOnboardingPage, isPricingFAQPage, isDocsPublicPage, isBlogPage, isLegalPage, isInteractiveDemoPage }) {
  // This component was causing issues when using useNavigate outside the router context.
  // For now, it's a placeholder. The main AI help button is rendered in Layout.jsx
  return null;
}