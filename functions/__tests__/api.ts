/**
 * Comprehensive API test suite
 * Tests authentication, rate limiting, validation, and core functionality
 */

import { assertEquals, assertExists, assert } from 'https://deno.land/std@0.208.0/assert/mod.ts';

const BASE_URL = Deno.env.get('TEST_BASE_URL') || 'http://localhost:8000/functions';
const TEST_API_KEY = Deno.env.get('TEST_API_KEY') || 'knxw_test_key_for_testing_only';

Deno.test('Health Check - Should return healthy status', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/health`);
  const data = await response.json();
  
  assertEquals(response.status, 200);
  assertEquals(data.status, 'healthy');
  assertExists(data.version);
  assertExists(data.timestamp);
});

Deno.test('Authentication - Should reject requests without API key', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'test_user',
      event_type: 'page_view'
    })
  });
  
  assertEquals(response.status, 401);
  const data = await response.json();
  assertEquals(data.success, false);
  assert(data.error.includes('Unauthorized'));
});

Deno.test('Authentication - Should reject invalid API key format', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer invalid_key'
    },
    body: JSON.stringify({
      user_id: 'test_user',
      event_type: 'page_view'
    })
  });
  
  assertEquals(response.status, 401);
});

Deno.test('Event Ingestion - Should accept valid event', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_API_KEY}`
    },
    body: JSON.stringify({
      user_id: 'test_user_123',
      event_type: 'page_view',
      event_payload: {
        url: '/test-page',
        referrer: '/home'
      },
      session_id: 'test_session',
      timestamp: new Date().toISOString()
    })
  });
  
  const data = await response.json();
  
  assertEquals(response.status, 202);
  assertEquals(data.success, true);
  assertExists(data.data.event_id);
  assertExists(data.meta.requestId);
});

Deno.test('Event Ingestion - Should reject invalid event type', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_API_KEY}`
    },
    body: JSON.stringify({
      user_id: 'test_user',
      event_type: 'invalid_type'
    })
  });
  
  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.success, false);
});

Deno.test('Profile Retrieval - Should return 404 for non-existent profile', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/profiles/nonexistent_user`, {
    headers: {
      'Authorization': `Bearer ${TEST_API_KEY}`
    }
  });
  
  assertEquals(response.status, 404);
  const data = await response.json();
  assertEquals(data.success, false);
});

Deno.test('Insights Query - Should validate input schema', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/insights/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_API_KEY}`
    },
    body: JSON.stringify({
      min_confidence: 1.5, // Invalid: > 1
      limit: 101 // Invalid: > 100
    })
  });
  
  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.success, false);
  assert(data.error.includes('Validation'));
});

Deno.test('Security Headers - Should include CSP and security headers', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/health`);
  
  assert(response.headers.has('X-Content-Type-Options'));
  assert(response.headers.has('X-Frame-Options'));
  assert(response.headers.has('Content-Security-Policy'));
  
  assertEquals(response.headers.get('X-Content-Type-Options'), 'nosniff');
  assertEquals(response.headers.get('X-Frame-Options'), 'DENY');
});

Deno.test('Request ID - Should include unique request ID in response', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/health`);
  
  assert(response.headers.has('X-Request-ID'));
  const requestId = response.headers.get('X-Request-ID');
  assert(requestId.length > 0);
});

Deno.test('OpenAPI Spec - Should return valid OpenAPI JSON', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/openapi`);
  const spec = await response.json();
  
  assertEquals(response.status, 200);
  assertEquals(spec.openapi, '3.0.3');
  assertExists(spec.info);
  assertExists(spec.paths);
  assertExists(spec.components);
});