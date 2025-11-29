import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';

const CollaborationContext = createContext(null);

// Simulated real-time collaboration using polling
// In production, this would use WebSockets or similar
export function CollaborationProvider({ children }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeUsers, setActiveUsers] = useState(new Map());
  const [cursors, setCursors] = useState(new Map());
  const [selections, setSelections] = useState(new Map());
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      broadcastPresence(user, location.pathname);
    }).catch(() => {});
  }, [location.pathname]);

  // Broadcast presence every 5 seconds
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      broadcastPresence(currentUser, location.pathname);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, location.pathname]);

  // Poll for other users' presence
  useEffect(() => {
    if (!currentUser) return;

    const pollPresence = async () => {
      try {
        // In real implementation, this would query a presence service
        // For now, we'll use localStorage as a simple demo
        const presenceData = localStorage.getItem('knxw_presence') || '{}';
        const presence = JSON.parse(presenceData);
        
        const now = Date.now();
        const active = new Map();
        
        Object.entries(presence).forEach(([userId, data]) => {
          if (userId !== currentUser.id && (now - data.lastSeen) < 15000) {
            active.set(userId, data);
          }
        });
        
        setActiveUsers(active);
      } catch (error) {
        console.error('Failed to poll presence:', error);
      }
    };

    const interval = setInterval(pollPresence, 3000);
    pollPresence();

    return () => clearInterval(interval);
  }, [currentUser]);

  const broadcastPresence = useCallback((user, path) => {
    if (!user) return;

    try {
      const presenceData = localStorage.getItem('knxw_presence') || '{}';
      const presence = JSON.parse(presenceData);
      
      presence[user.id] = {
        userId: user.id,
        email: user.email,
        name: user.full_name || user.email,
        path: path,
        lastSeen: Date.now(),
        color: getUserColor(user.id)
      };
      
      localStorage.setItem('knxw_presence', JSON.stringify(presence));
    } catch (error) {
      console.error('Failed to broadcast presence:', error);
    }
  }, []);

  const updateCursor = useCallback((x, y) => {
    if (!currentUser) return;

    setCursors(prev => {
      const updated = new Map(prev);
      updated.set(currentUser.id, { x, y, timestamp: Date.now() });
      return updated;
    });

    setLastActivity(Date.now());
  }, [currentUser]);

  const updateSelection = useCallback((elementId, data) => {
    if (!currentUser) return;

    setSelections(prev => {
      const updated = new Map(prev);
      updated.set(currentUser.id, { elementId, data, timestamp: Date.now() });
      return updated;
    });

    setLastActivity(Date.now());
  }, [currentUser]);

  const clearSelection = useCallback(() => {
    if (!currentUser) return;

    setSelections(prev => {
      const updated = new Map(prev);
      updated.delete(currentUser.id);
      return updated;
    });
  }, [currentUser]);

  const value = {
    currentUser,
    activeUsers,
    cursors,
    selections,
    updateCursor,
    updateSelection,
    clearSelection,
    isCollaborating: activeUsers.size > 0
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    return {
      currentUser: null,
      activeUsers: new Map(),
      cursors: new Map(),
      selections: new Map(),
      updateCursor: () => {},
      updateSelection: () => {},
      clearSelection: () => {},
      isCollaborating: false
    };
  }
  return context;
}

function getUserColor(userId) {
  const colors = [
    '#00d4ff', '#10b981', '#fbbf24', '#ec4899', '#8b5cf6',
    '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6', '#a855f7'
  ];
  
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}