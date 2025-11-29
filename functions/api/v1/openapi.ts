import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'knXw Psychographic Intelligence API',
    version: '1.0.0',
    description: 'REST API for psychographic analytics, AI-powered insights, and personalized recommendations. Build applications that understand user psychology and behavior patterns.',
    contact: {
      name: 'knXw Support',
      email: 'support@knxw.io',
      url: 'https://knxw.io/support'
    },
    license: {
      name: 'Proprietary',
      url: 'https://knxw.io/terms'
    }
  },
  servers: [
    {
      url: 'https://your-app.base44.com/functions',
      description: 'Production API'
    }
  ],
  security: [
    {
      bearerAuth: []
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: 'Use your API key as a Bearer token. Format: `Authorization: Bearer knxw_your_api_key_here`'
      }
    },
    schemas: {
      Event: {
        type: 'object',
        required: ['user_id', 'event_type'],
        properties: {
          user_id: {
            type: 'string',
            description: 'Unique identifier for the user',
            example: 'user_123'
          },
          event_type: {
            type: 'string',
            description: 'Type of event',
            enum: ['page_view', 'click', 'form_submit', 'purchase', 'signup', 'feature_usage'],
            example: 'page_view'
          },
          event_payload: {
            type: 'object',
            description: 'Additional event data',
            additionalProperties: true,
            example: {
              url: 'https://example.com/pricing',
              referrer: 'https://google.com',
              duration: 45
            }
          },
          session_id: {
            type: 'string',
            description: 'Browser session identifier',
            example: 'sess_abc123'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Event timestamp (ISO 8601)',
            example: '2024-01-15T10:30:00Z'
          }
        }
      },
      Profile: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            description: 'User identifier',
            example: 'user_123'
          },
          motivations: {
            type: 'array',
            description: 'Primary psychological motivations',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', example: 'achievement' },
                weight: { type: 'number', minimum: 0, maximum: 1, example: 0.85 }
              }
            }
          },
          cognitive_style: {
            type: 'string',
            enum: ['analytical', 'intuitive', 'systematic', 'creative'],
            description: 'How the user processes information',
            example: 'analytical'
          },
          risk_profile: {
            type: 'string',
            enum: ['conservative', 'moderate', 'aggressive'],
            description: 'User risk tolerance level',
            example: 'moderate'
          },
          personality_traits: {
            type: 'object',
            description: 'Big Five personality dimensions (0-1 scale)',
            properties: {
              openness: { type: 'number', minimum: 0, maximum: 1, example: 0.75 },
              conscientiousness: { type: 'number', minimum: 0, maximum: 1, example: 0.82 },
              extraversion: { type: 'number', minimum: 0, maximum: 1, example: 0.65 },
              agreeableness: { type: 'number', minimum: 0, maximum: 1, example: 0.78 },
              neuroticism: { type: 'number', minimum: 0, maximum: 1, example: 0.42 }
            }
          },
          confidence_score: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'AI confidence in the profile analysis',
            example: 0.87
          },
          last_analyzed: {
            type: 'string',
            format: 'date-time',
            description: 'When the profile was last updated',
            example: '2024-01-15T10:30:00Z'
          }
        }
      },
      Insight: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'insight_abc123' },
          user_id: { type: 'string', example: 'user_123' },
          type: {
            type: 'string',
            enum: ['behavioral_pattern', 'motivation_shift', 'engagement_optimization', 'churn_risk'],
            example: 'engagement_optimization'
          },
          title: { type: 'string', example: 'High-value feature discovery opportunity' },
          description: { type: 'string', example: 'User shows strong analytical traits but hasn\'t discovered advanced reporting features yet.' },
          confidence: { type: 'number', minimum: 0, maximum: 1, example: 0.89 },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
            example: ['Show tutorial for advanced analytics', 'Send personalized email with data insights']
          },
          created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
        }
      },
      Recommendation: {
        type: 'object',
        properties: {
          user_id: { type: 'string', example: 'user_123' },
          content_type: {
            type: 'string',
            enum: ['blog_post', 'documentation', 'feature_guide', 'tutorial'],
            example: 'feature_guide'
          },
          content_id: { type: 'string', example: 'guide_analytics_101' },
          content_title: { type: 'string', example: 'Advanced Analytics for Data-Driven Teams' },
          content_url: { type: 'string', example: '/guides/analytics' },
          match_reasoning: {
            type: 'string',
            example: 'Matches analytical cognitive style and achievement motivation'
          },
          confidence_score: { type: 'number', minimum: 0, maximum: 1, example: 0.91 }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Validation error' },
          details: { type: 'string', example: 'user_id is required' },
          meta: {
            type: 'object',
            properties: {
              requestId: { type: 'string', example: 'req_abc123' },
              tenantId: { type: 'string', example: 'tenant_xyz' },
              latencyMs: { type: 'number', example: 45 }
            }
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication failed - invalid or missing API key',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: 'Unauthorized',
              details: 'Invalid or missing API key',
              meta: { requestId: 'req_abc123', tenantId: 'anonymous', latencyMs: 12 }
            }
          }
        }
      },
      RateLimitError: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: 'Rate limit exceeded',
              details: 'Too many requests. Please try again later.',
              meta: { requestId: 'req_abc123', tenantId: 'tenant_xyz', latencyMs: 8 }
            }
          }
        }
      },
      ValidationError: {
        description: 'Request validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: 'Validation error',
              details: [{ path: ['user_id'], message: 'Required' }],
              meta: { requestId: 'req_abc123', tenantId: 'tenant_xyz', latencyMs: 15 }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/v1/health': {
      get: {
        summary: 'Health Check',
        description: 'Check API health and get system information',
        tags: ['System'],
        security: [],
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    version: { type: 'string', example: '1.0.0' },
                    uptime: { type: 'number', example: 123456 },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/events': {
      post: {
        summary: 'Ingest Event',
        description: 'Send a behavioral event to build psychographic profiles. Events are processed asynchronously and profiles are updated in real-time.',
        tags: ['Events'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Event' },
              examples: {
                page_view: {
                  summary: 'Page View Event',
                  value: {
                    user_id: 'user_123',
                    event_type: 'page_view',
                    event_payload: {
                      url: 'https://example.com/pricing',
                      referrer: 'https://google.com',
                      duration: 45
                    },
                    session_id: 'sess_abc123',
                    timestamp: '2024-01-15T10:30:00Z'
                  }
                },
                purchase: {
                  summary: 'Purchase Event',
                  value: {
                    user_id: 'user_456',
                    event_type: 'purchase',
                    event_payload: {
                      product_id: 'prod_789',
                      amount: 99.99,
                      currency: 'USD'
                    },
                    session_id: 'sess_def456',
                    timestamp: '2024-01-15T11:00:00Z'
                  }
                }
              }
            }
          }
        },
        responses: {
          '202': {
            description: 'Event accepted for processing',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        event_id: { type: 'string', example: 'evt_abc123' },
                        status: { type: 'string', example: 'accepted' },
                        message: { type: 'string', example: 'Event ingested successfully. Profile analysis queued.' }
                      }
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        requestId: { type: 'string' },
                        tenantId: { type: 'string' },
                        latencyMs: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '429': { $ref: '#/components/responses/RateLimitError' }
        }
      }
    },
    '/api/v1/profiles/{user_id}': {
      get: {
        summary: 'Get User Profile',
        description: 'Retrieve the complete psychographic profile for a user, including motivations, cognitive style, personality traits, and confidence scores.',
        tags: ['Profiles'],
        parameters: [
          {
            name: 'user_id',
            in: 'path',
            required: true,
            description: 'Unique user identifier',
            schema: { type: 'string' },
            example: 'user_123'
          }
        ],
        responses: {
          '200': {
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Profile' },
                    meta: {
                      type: 'object',
                      properties: {
                        requestId: { type: 'string' },
                        tenantId: { type: 'string' },
                        latencyMs: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Profile not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '429': { $ref: '#/components/responses/RateLimitError' }
        }
      }
    },
    '/api/v1/insights/query': {
      post: {
        summary: 'Query Insights',
        description: 'Get AI-powered behavioral insights and recommendations for one or more users. Supports filtering by insight type and minimum confidence threshold.',
        tags: ['Insights'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user_ids: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of user IDs to query (optional, omit for all users)',
                    example: ['user_123', 'user_456']
                  },
                  insight_type: {
                    type: 'string',
                    enum: ['behavioral_pattern', 'motivation_shift', 'engagement_optimization', 'churn_risk'],
                    description: 'Filter by insight type (optional)',
                    example: 'engagement_optimization'
                  },
                  min_confidence: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1,
                    description: 'Minimum confidence threshold (default: 0.7)',
                    example: 0.8
                  },
                  limit: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 100,
                    description: 'Maximum number of insights to return (default: 20)',
                    example: 10
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Insights retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Insight' }
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        requestId: { type: 'string' },
                        tenantId: { type: 'string' },
                        latencyMs: { type: 'number' },
                        total: { type: 'integer', example: 42 }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '429': { $ref: '#/components/responses/RateLimitError' }
        }
      }
    },
    '/api/v1/recommendations': {
      post: {
        summary: 'Get Recommendations',
        description: 'Generate personalized content recommendations based on user psychology. Returns content matched to the user\'s cognitive style, motivations, and preferences.',
        tags: ['Recommendations'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['user_id'],
                properties: {
                  user_id: {
                    type: 'string',
                    description: 'User identifier',
                    example: 'user_123'
                  },
                  content_types: {
                    type: 'array',
                    items: {
                      type: 'string',
                      enum: ['blog_post', 'documentation', 'feature_guide', 'tutorial']
                    },
                    description: 'Filter by content types (optional)',
                    example: ['feature_guide', 'tutorial']
                  },
                  limit: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 20,
                    description: 'Number of recommendations (default: 5)',
                    example: 3
                  },
                  refresh: {
                    type: 'boolean',
                    description: 'Force regeneration of recommendations (default: false)',
                    example: false
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Recommendations generated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Recommendation' }
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        requestId: { type: 'string' },
                        tenantId: { type: 'string' },
                        latencyMs: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': {
            description: 'Profile not found for user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          '429': { $ref: '#/components/responses/RateLimitError' }
        }
      }
    },
    '/api/v1/usage': {
      get: {
        summary: 'Get Usage Statistics',
        description: 'Retrieve API usage metrics including request counts, error rates, latency percentiles, and endpoint-level statistics.',
        tags: ['Usage'],
        parameters: [
          {
            name: 'days',
            in: 'query',
            description: 'Number of days to query (1-90, default: 7)',
            schema: { type: 'integer', minimum: 1, maximum: 90, default: 7 },
            example: 7
          }
        ],
        responses: {
          '200': {
            description: 'Usage data retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        period: {
                          type: 'object',
                          properties: {
                            start: { type: 'string', format: 'date-time' },
                            end: { type: 'string', format: 'date-time' },
                            days: { type: 'integer', example: 7 }
                          }
                        },
                        totals: {
                          type: 'object',
                          properties: {
                            requests: { type: 'integer', example: 12450 },
                            successful: { type: 'integer', example: 12150 },
                            failed: { type: 'integer', example: 150 },
                            rateLimited: { type: 'integer', example: 50 },
                            errorRate: { type: 'string', example: '1.20%' }
                          }
                        },
                        latency: {
                          type: 'object',
                          properties: {
                            p50: { type: 'number', example: 85 },
                            p95: { type: 'number', example: 235 },
                            p99: { type: 'number', example: 420 },
                            unit: { type: 'string', example: 'milliseconds' }
                          }
                        },
                        byEndpoint: {
                          type: 'object',
                          additionalProperties: {
                            type: 'object',
                            properties: {
                              count: { type: 'integer' },
                              avgLatency: { type: 'number' }
                            }
                          }
                        },
                        dailyBreakdown: {
                          type: 'object',
                          additionalProperties: { type: 'integer' }
                        }
                      }
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        requestId: { type: 'string' },
                        tenantId: { type: 'string' },
                        latencyMs: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '429': { $ref: '#/components/responses/RateLimitError' }
        }
      }
    },
    '/api/v1/webhooks/endpoints': {
      get: {
        summary: 'List Webhook Endpoints',
        description: 'Get all configured webhook endpoints for your tenant',
        tags: ['Webhooks'],
        responses: {
          '200': {
            description: 'Webhook endpoints retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'wh_abc123' },
                          name: { type: 'string', example: 'Production Webhook' },
                          url: { type: 'string', example: 'https://example.com/webhooks/knxw' },
                          events: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['profile.updated', 'insight.created']
                          },
                          status: { type: 'string', enum: ['active', 'paused'], example: 'active' },
                          created_at: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' }
        }
      },
      post: {
        summary: 'Create Webhook Endpoint',
        description: 'Register a new webhook endpoint to receive real-time events. All webhook payloads are signed with HMAC-SHA256.',
        tags: ['Webhooks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'url', 'events'],
                properties: {
                  name: { type: 'string', example: 'Production Webhook' },
                  url: {
                    type: 'string',
                    format: 'uri',
                    description: 'HTTPS URL where events will be sent',
                    example: 'https://example.com/webhooks/knxw'
                  },
                  events: {
                    type: 'array',
                    items: {
                      type: 'string',
                      enum: ['profile.updated', 'insight.created', 'recommendation.generated']
                    },
                    description: 'Event types to subscribe to',
                    example: ['profile.updated', 'insight.created']
                  },
                  secret: {
                    type: 'string',
                    description: 'Optional webhook secret for signature verification. If not provided, one will be generated.',
                    example: 'whsec_abc123def456'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Webhook endpoint created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'wh_abc123' },
                        name: { type: 'string', example: 'Production Webhook' },
                        url: { type: 'string', example: 'https://example.com/webhooks/knxw' },
                        events: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['profile.updated', 'insight.created']
                        },
                        secret: { type: 'string', example: 'whsec_abc123def456' },
                        status: { type: 'string', example: 'active' }
                      }
                    },
                    message: { type: 'string', example: 'Webhook endpoint created successfully' }
                  }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' }
        }
      }
    }
  },
  tags: [
    { name: 'System', description: 'System health and status endpoints' },
    { name: 'Events', description: 'Behavioral event ingestion' },
    { name: 'Profiles', description: 'Psychographic profile management' },
    { name: 'Insights', description: 'AI-powered behavioral insights' },
    { name: 'Recommendations', description: 'Personalized content recommendations' },
    { name: 'Usage', description: 'API usage and metrics' },
    { name: 'Webhooks', description: 'Webhook configuration and management' }
  ]
};

Deno.serve((req) => {
  try {
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Allow': 'GET' }
      });
    }

    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}/functions`;
    
    const spec = { ...OPENAPI_SPEC };
    spec.servers = [{ url: baseUrl, description: 'Current API Server' }];

    return new Response(JSON.stringify(spec, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('OpenAPI spec error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});