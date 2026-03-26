
/**
 * Zod validation schemas for API endpoints
 */

import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';

export const EventIngestSchema = z.object({
  user_id: z.string().min(1).max(256),
  event_type: z.enum([
    'page_view',
    'click',
    'form_submit',
    'form_focus',
    'scroll',
    'hover',
    'exit_intent',
    'time_on_page',
    'purchase',
    'signup',
    'feature_usage',
    'product_view',
    'pricing_view',
    'add_to_cart',
    'checkout_start',
    'checkout_complete'
  ]),
  event_payload: z.record(z.any()).optional().default({}),
  session_id: z.string().optional(),
  timestamp: z.string().datetime().optional()
});

export const ProfileGetSchema = z.object({
  user_id: z.string().min(1).max(256)
});

export const InsightsQuerySchema = z.object({
  user_ids: z.array(z.string()).optional(),
  insight_type: z.enum([
    'behavioral_pattern',
    'motivation_shift',
    'engagement_optimization',
    'churn_risk'
  ]).optional(),
  min_confidence: z.number().min(0).max(1).optional().default(0.7),
  limit: z.number().int().min(1).max(100).optional().default(20)
});

export const RecommendationsSchema = z.object({
  user_id: z.string().min(1).max(256),
  content_types: z.array(z.enum([
    'blog_post',
    'documentation',
    'feature_guide',
    'tutorial'
  ])).optional(),
  limit: z.number().int().min(1).max(20).optional().default(5),
  refresh: z.boolean().optional().default(false)
});

export const WebhookEndpointSchema = z.object({
  name: z.string().min(1).max(256),
  url: z.string().url(),
  events: z.array(z.enum([
    'profile.updated',
    'insight.created',
    'recommendation.generated'
  ])).min(1),
  secret: z.string().optional()
});
