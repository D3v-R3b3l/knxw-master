import React, { useEffect, useState } from 'react';
import { useCollaboration } from './CollaborationProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';

export default function CollaborativeCursors() {
  const { activeUsers, cursors, currentUser } = useCollaboration();
  const [visibleCursors, setVisibleCursors] = useState([]);

  useEffect(() => {
    const visible = Array.from(activeUsers.values())
      .filter(user => user.userId !== currentUser?.id)
      .map(user => {
        const cursor = cursors.get(user.userId);
        return cursor ? { ...user, ...cursor } : null;
      })
      .filter(Boolean);

    setVisibleCursors(visible);
  }, [activeUsers, cursors, currentUser]);

  return (
    <AnimatePresence>
      {visibleCursors.map(cursor => (
        <motion.div
          key={cursor.userId}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, x: cursor.x, y: cursor.y }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed pointer-events-none z-50"
          style={{ left: 0, top: 0 }}
        >
          <div className="relative">
            <MousePointer2 
              className="w-5 h-5" 
              style={{ color: cursor.color }}
              fill={cursor.color}
            />
            <div 
              className="absolute top-5 left-5 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg"
              style={{ backgroundColor: cursor.color, color: '#fff' }}
            >
              {cursor.name}
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}