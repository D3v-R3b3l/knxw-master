import React from 'react';
import { useCollaboration } from './CollaborationProvider';
import { Users, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function PresenceIndicator({ resourceId = null }) {
  const { activeUsers, currentUser } = useCollaboration();
  
  const relevantUsers = resourceId
    ? Array.from(activeUsers.values()).filter(user => user.currentResource === resourceId)
    : Array.from(activeUsers.values());

  if (relevantUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4 text-[#a3a3a3]" />
        <span className="text-xs text-[#a3a3a3]">
          {relevantUsers.length} {relevantUsers.length === 1 ? 'person' : 'people'} viewing
        </span>
      </div>
      
      <div className="flex -space-x-2">
        <AnimatePresence>
          {relevantUsers.slice(0, 5).map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
              style={{ zIndex: 10 - index }}
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div 
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] bg-[#10b981]"
                title="Online"
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {relevantUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-[#262626] flex items-center justify-center text-xs font-bold text-white">
            +{relevantUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}