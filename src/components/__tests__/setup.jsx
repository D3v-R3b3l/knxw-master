// Frontend testing setup and utilities
import React from 'react';

// Mock implementations for common dependencies
export const mockEntities = {
  UserPsychographicProfile: {
    list: () => Promise.resolve([]),
    filter: () => Promise.resolve([]),
    create: (data) => Promise.resolve({ id: 'mock_id', ...data }),
    update: (id, data) => Promise.resolve({ id, ...data }),
    delete: () => Promise.resolve(true)
  },
  CapturedEvent: {
    list: () => Promise.resolve([]),
    filter: () => Promise.resolve([]),
    create: (data) => Promise.resolve({ id: 'mock_id', ...data })
  },
  PsychographicInsight: {
    list: () => Promise.resolve([]),
    filter: () => Promise.resolve([])
  },
  User: {
    me: () => Promise.resolve({
      id: 'test_user',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'user'
    }),
    updateMyUserData: (data) => Promise.resolve(data)
  }
};

// Mock function calls
export const mockFunctions = {
  liveProfileProcessor: () => Promise.resolve({ success: true }),
  triggerCheckin: () => Promise.resolve({ 
    data: { title: 'Test Checkin', questions: ['How are you?'] } 
  }),
  batchAnalytics: () => Promise.resolve({ data: { segments: [] } }),
  evaluateEngagementRules: () => Promise.resolve({ engagements: [] })
};

// Mock integrations
export const mockIntegrations = {
  InvokeLLM: () => Promise.resolve({ 
    insights: ['Test insight'], 
    confidence: 0.8 
  }),
  SendEmail: () => Promise.resolve({ success: true }),
  UploadFile: () => Promise.resolve({ file_url: 'https://example.com/file.jpg' })
};

// Test utilities
export class TestUtils {
  static createMockProfile(overrides = {}) {
    return {
      id: 'profile_1',
      user_id: 'user_1',
      schema_version: 'v1.3.0',
      motivation_stack_v2: [
        { label: 'achievement', weight: 0.8 },
        { label: 'security', weight: 0.6 }
      ],
      emotional_state: { mood: 'confident', confidence: 0.7 },
      risk_profile: 'moderate',
      cognitive_style: 'analytical',
      personality_traits: {
        openness: 0.7,
        conscientiousness: 0.8,
        extraversion: 0.5
      },
      last_analyzed: new Date().toISOString(),
      ...overrides
    };
  }

  static createMockEvent(overrides = {}) {
    return {
      id: 'event_1',
      user_id: 'user_1',
      event_type: 'page_view',
      event_payload: { url: '/test-page' },
      timestamp: new Date().toISOString(),
      processed: false,
      ...overrides
    };
  }

  static createMockInsight(overrides = {}) {
    return {
      id: 'insight_1',
      user_id: 'user_1',
      insight_type: 'behavioral_pattern',
      title: 'Test Insight',
      description: 'This is a test insight',
      confidence_score: 0.8,
      actionable_recommendations: ['Take action A', 'Consider option B'],
      created_date: new Date().toISOString(),
      ...overrides
    };
  }

  static mockSuccessfulApiCall(mockFn, data) {
    mockFn.mockResolvedValue = () => Promise.resolve(data);
  }

  static mockFailedApiCall(mockFn, error) {
    mockFn.mockRejectedValue = () => Promise.reject(new Error(error));
  }

  static async measureRenderTime(renderFunction) {
    const startTime = performance.now();
    await renderFunction();
    const endTime = performance.now();
    return endTime - startTime;
  }
}

// Mock localStorage for testing
export const mockLocalStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Mock fetch for testing
export const mockFetch = () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve('')
});