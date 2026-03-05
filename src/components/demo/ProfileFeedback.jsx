import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileFeedback({ messageId, onSubmit }) {
  const [profileRating, setProfileRating] = useState(null); // 'accurate' | 'inaccurate'
  const [uiRating, setUiRating] = useState(null); // 'relevant' | 'irrelevant'
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!profileRating && !uiRating) return;
    onSubmit({
      messageId,
      profile_rating: profileRating === 'accurate' ? 5 : 2,
      ui_rating: uiRating === 'relevant' ? 5 : 2,
      comment: comment.trim()
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 mt-2 text-[10px] text-[#10b981]"
      >
        <CheckCircle2 className="w-3 h-3" />
        <span>Thanks — feedback captured to improve future inferences</span>
      </motion.div>
    );
  }

  return (
    <div className="mt-3 pt-2 border-t border-[#333]">
      <p className="text-[10px] text-[#6b7280] mb-2 uppercase tracking-wider">Rate this response</p>
      <div className="flex flex-wrap gap-3 items-center">
        {/* Profile accuracy */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[#a3a3a3]">Profile:</span>
          <button
            onClick={() => setProfileRating(profileRating === 'accurate' ? null : 'accurate')}
            className={`p-1 rounded transition-colors ${profileRating === 'accurate' ? 'text-[#10b981]' : 'text-[#6b7280] hover:text-[#a3a3a3]'}`}
            title="Profile is accurate"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setProfileRating(profileRating === 'inaccurate' ? null : 'inaccurate')}
            className={`p-1 rounded transition-colors ${profileRating === 'inaccurate' ? 'text-[#ef4444]' : 'text-[#6b7280] hover:text-[#a3a3a3]'}`}
            title="Profile is inaccurate"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* UI relevance */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[#a3a3a3]">UI relevance:</span>
          <button
            onClick={() => setUiRating(uiRating === 'relevant' ? null : 'relevant')}
            className={`p-1 rounded transition-colors ${uiRating === 'relevant' ? 'text-[#10b981]' : 'text-[#6b7280] hover:text-[#a3a3a3]'}`}
            title="UI elements are relevant"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setUiRating(uiRating === 'irrelevant' ? null : 'irrelevant')}
            className={`p-1 rounded transition-colors ${uiRating === 'irrelevant' ? 'text-[#ef4444]' : 'text-[#6b7280] hover:text-[#a3a3a3]'}`}
            title="UI elements are irrelevant"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Comment toggle */}
        <button
          onClick={() => setShowComment(!showComment)}
          className="p-1 text-[#6b7280] hover:text-[#a3a3a3] transition-colors"
          title="Add comment"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>

        {/* Submit */}
        {(profileRating || uiRating) && (
          <button
            onClick={handleSubmit}
            className="text-[10px] px-2 py-0.5 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 hover:bg-[#00d4ff]/20 transition-colors"
          >
            Submit
          </button>
        )}
      </div>

      <AnimatePresence>
        {showComment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What was off? (optional)"
              className="w-full text-[11px] bg-[#111111] border border-[#333] rounded-lg p-2 text-white placeholder:text-[#6b7280] focus:outline-none focus:border-[#00d4ff]/50 resize-none"
              rows={2}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}