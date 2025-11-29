
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MousePointer, Eye, Clock, Navigation, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from 'date-fns'; // Keep for now, though safeFormatDate will be removed.
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AssistButton from "./AssistButton";

const eventIcons = {
  click: MousePointer,
  page_view: Eye,
  scroll: Activity,
  form_submit: Navigation,
  form_focus: Clock,
  hover: MousePointer,
  exit_intent: Navigation,
  time_on_page: Clock,
  identify: Activity,
};

const eventColors = {
  click: 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30',
  page_view: 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30',
  scroll: 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30',
  form_submit: 'bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30',
  form_focus: 'bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30',
  hover: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30',
  exit_intent: 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30',
  time_on_page: 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30',

  product_view: 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/30',
  pricing_view: 'bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/30',
  add_to_cart: 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30',
  checkout_start: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30',
  checkout_complete: 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30',
  signup: 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30',
  feature_usage: 'bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed]/30',
  article_read: 'bg-[#14b8a6]/20 text-[#14b8a6] border-[#14b8a6]/30',
  video_play: 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30',
  share: 'bg-[#e879f9]/20 text-[#e879f9] border-[#e879f9]/30',
  comment: 'bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/30',
  subscribe_view: 'bg-[#84cc16]/20 text-[#84cc16] border-[#84cc16]/30',

  default: 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'
};

function eventDisplayName(type = 'unknown') {
  const map = {
    page_view: 'Page View',
    click: 'Click',
    scroll: 'Scroll',
    form_submit: 'Form Submit',
    form_focus: 'Form Focus',
    hover: 'Hover',
    exit_intent: 'Exit Intent',
    time_on_page: 'Time on Page',
    identify: 'Identify',
    product_view: 'Product View',
    pricing_view: 'Pricing View',
    add_to_cart: 'Add to Cart',
    checkout_start: 'Checkout Start',
    checkout_complete: 'Checkout Complete',
    signup: 'Signup',
    feature_usage: 'Feature Usage',
    article_read: 'Article Read',
    video_play: 'Video Play',
    share: 'Share',
    comment: 'Comment',
    subscribe_view: 'Subscribe View',
  };
  if (map[type]) return map[type];
  return String(type).replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

// NEW: compact timestamp helper
const compactTimeAgo = (timestamp) => {
  try {
    if (!timestamp) return 'now';
    
    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return 'now';
    }
    
    if (isNaN(date.getTime())) {
      return 'now';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return '1w+ ago';
  } catch (error) {
    return 'now';
  }
};

function shortId(str) {
  if (!str) return 'Unknown user';
  if (str.length <= 8) return str;
  return `${str.slice(0, 4)}…${str.slice(-2)}`;
}

export default function RealTimeActivity({ events, isLoading }) {
  const getEventDescription = (event) => {
    const payload = event.event_payload || {};
    switch (event.event_type) {
      case 'click':
        return `Clicked ${payload.element || 'element'}`;
      case 'page_view':
        return `Viewed ${payload.path || payload.url || 'page'}`;
      case 'add_to_cart':
        return payload.product_id ? `Added ${payload.product_id} to cart` : 'Added item to cart';
      case 'checkout_complete':
        return payload.order_id ? `Completed order ${String(payload.order_id).slice(0, 8)}` : 'Completed checkout';
      case 'signup':
        return payload.plan_selected ? `Signed up for ${payload.plan_selected}` : 'Created account';
      case 'pricing_view':
        return 'Compared pricing plans';
      case 'product_view':
        return payload.product_id ? `Viewed ${payload.product_id}` : 'Viewed product';
      default:
        return eventDisplayName(event.event_type);
    }
  };

  return (
    <Card className="bg-[#111111] border-[#262626] card-hover h-full">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            Real-Time Activity Stream
            <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
          </CardTitle>
          <AssistButton aiContext="Analyze the most recent user activities and suggest engagement or remediation steps." />
        </div>
        <p className="text-sm text-[#a3a3a3]">Live user interactions from across your app</p>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="space-y-3 max-h-96 overflow-y-auto overflow-x-hidden sidebar-scroll">
          {isLoading && events.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-[#a3a3a3]">Waiting for new events...</p>
            </div>
          ) : (
            <AnimatePresence>
              {events.map((event) => {
                const IconComponent = eventIcons[event.event_type] || Activity;
                const url = `${createPageUrl("Events")}?q=${encodeURIComponent(event.user_id || '')}&type=${encodeURIComponent(event.event_type || '')}&highlightId=${encodeURIComponent(event.id || "")}`;
                const colorClass = eventColors[event.event_type] || eventColors.default;

                return (
                  <Link key={event.id || `event-${Math.random()}`} to={url} className="block">
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                      className="group flex items-start gap-3 p-4 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#00d4ff]/40 transition-colors"
                      id={`rt-${event.id || ''}`}
                    >
                      {/* Icon */}
                      <div className="p-2 rounded-lg bg-[#00d4ff]/15 flex-shrink-0 mt-0.5">
                        <IconComponent className="w-4 h-4 text-[#00d4ff]" />
                      </div>

                      {/* Content - Mobile optimized stacked layout */}
                      <div className="flex-1 min-w-0">
                        {/* Primary: Event description */}
                        <div className="text-sm font-medium text-white leading-tight mb-1">
                          {getEventDescription(event)}
                        </div>
                        
                        {/* Secondary: User ID + Time + Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-[#a3a3a3]">{shortId(event.user_id)}</span>
                          <span className="text-xs text-[#6b7280]">•</span>
                          <span className="text-xs text-[#a3a3a3]">{compactTimeAgo(event.timestamp)}</span>
                          
                          {/* Badges - only if space allows */}
                          <div className="flex items-center gap-1 ml-auto">
                            {event.isDemo && (
                              <span className="inline-flex items-center rounded-full bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/30 text-[10px] leading-none px-1.5 py-0.5 whitespace-nowrap">
                                Demo
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center rounded-full border ${colorClass} text-[10px] leading-none px-1.5 py-0.5 whitespace-nowrap max-w-[80px] truncate`}
                              title={eventDisplayName(event.event_type)}
                            >
                              {eventDisplayName(event.event_type)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
