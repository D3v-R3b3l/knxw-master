import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, LogOut, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

const ProfileMenu = React.memo(() => {
  const [user, setUser] = React.useState(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = React.useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('User not authenticated:', error);
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const handleSignOut = () => {
    setShowDropdown(false);
    setShowSignOutDialog(true);
  };

  const confirmSignOut = async () => {
    try {
      // Clear all authentication-related storage
      try {
        localStorage.removeItem('knxw_token');
        localStorage.removeItem('knxw_user');
        localStorage.removeItem('knxw_session');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Error clearing storage:', e);
      }

      // Call logout on Base44 SDK
      await base44.auth.logout();
      
      // Hard redirect to landing page (clears all app state)
      window.location.href = createPageUrl('Landing');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if logout fails, still redirect to landing
      window.location.href = createPageUrl('Landing');
    } finally {
      setShowSignOutDialog(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="relative flex-1">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 w-full p-3 rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#111111] border border-[#262626] shadow-lg hover:border-[#00d4ff]/30 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-xl flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-semibold text-sm text-white truncate">
              {user.full_name || 'User'}
            </p>
            <p className="text-xs text-[#a3a3a3] truncate">
              {user.email}
            </p>
          </div>
          <div className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-[#a3a3a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {showDropdown && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-[#111111] border border-[#262626] rounded-xl shadow-xl z-50">
            <Link
              to={createPageUrl("Profile")}
              className="flex items-center gap-3 w-full p-3 text-left hover:bg-[#1a1a1a] rounded-t-xl transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <User className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm text-white">View Profile</span>
            </Link>
            <div className="border-t border-[#262626]" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full p-3 text-left hover:bg-[#1a1a1a] rounded-b-xl transition-colors text-[#ef4444] hover:bg-[#ef4444]/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmationDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        title="Sign Out"
        description="Are you sure you want to sign out of knXw? You'll need to log back in to access your analytics and insights."
        confirmText="Sign Out"
        cancelText="Stay Logged In"
        onConfirm={confirmSignOut}
        variant="destructive"
      />
    </>
  );
});

export default ProfileMenu;