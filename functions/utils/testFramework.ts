// Comprehensive testing framework for backend functions
import { createClient } from 'npm:@base44/sdk@0.7.1';

export class TestFramework {
  constructor() {
    this.tests = new Map();
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
    this.beforeAllHooks = [];
    this.afterAllHooks = [];
    this.testResults = [];
    this.base44 = null;
  }

  async initialize() {
    this.base44 = createClient(Deno.env.get('BASE44_APP_ID')).asServiceRole;
    await this.setupTestEnvironment();
  }

  async setupTestEnvironment() {
    console.log('Setting up test environment...');
    
    try {
      await this.base44.entities.UserPsychographicProfile.create({
        user_id: 'test_user_001',
        schema_version: 'v1.3.0',
        motivation_stack_v2: [
          { label: 'achievement', weight: 0.8 },
          { label: 'security', weight: 0.6 }
        ],
        emotional_state: { mood: 'confident', confidence: 0.7 },
        risk_profile: 'moderate',
        cognitive_style: 'analytical',
        is_demo: true
      });

      await this.base44.entities.CapturedEvent.create({
        user_id: 'test_user_001',
        event_type: 'page_view',
        event_payload: { url: '/test-page' },
        timestamp: new Date().toISOString(),
        is_demo: true
      });

      console.log('Test environment setup complete');
    } catch (error) {
      console.error('Error setting up test environment:', error);
      throw error;
    }
  }

  async cleanupTestEnvironment() {
    console.log('Cleaning up test environment...');
    
    try {
      const testEntities = [
        'UserPsychographicProfile',
        'CapturedEvent',
        'PsychographicInsight',
        'EngagementRule',
        'EngagementTemplate',
        'EngagementDelivery'
      ];

      for (const entityName of testEntities) {
        try {
          const testRecords = await this.base44.entities[entityName].filter({
            is_demo: true
          });
          
          for (const record of testRecords) {
            await this.base44.entities[entityName].delete(record.id);
          }
        } catch (error) {
          console.warn(`Could not clean ${entityName}:`, error.message);
        }
      }
      
      console.log('Test environment cleanup complete');
    } catch (error) {
      console.error('Error cleaning up test environment:', error);
    }
  }

  describe(suiteName, suiteFunction) {
    this.tests.set(suiteName, suiteFunction);
  }

  beforeEach(hook) {
    this.beforeEachHooks.push(hook);
  }

  afterEach(hook) {
    this.afterEachHooks.push(hook);
  }

  beforeAll(hook) {
    this.beforeAllHooks.push(hook);
  }

  afterAll(hook) {
    this.afterAllHooks.push(hook);
  }

  it(testName, testFunction) {
    return {
      name: testName,
      fn: testFunction,
      skip: false,
      only: false
    };
  }

  async runAllTests() {
    console.log('🧪 Starting test execution...');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    try {
      for (const hook of this.beforeAllHooks) {
        await hook();
      }

      for (const [suiteName, suiteFunction] of this.tests) {
        console.log(`\n📋 Running test suite: ${suiteName}`);
        
        const suiteTests = [];
        const mockIt = (name, fn) => suiteTests.push({ name, fn });
        
        await suiteFunction(mockIt);
        
        for (const test of suiteTests) {
          totalTests++;
          
          try {
            for (const hook of this.beforeEachHooks) {
              await hook();
            }

            console.log(`  ▶️ ${test.name}`);
            
            await test.fn();
            
            console.log(`  ✅ ${test.name}`);
            passedTests++;
            
            this.testResults.push({
              suite: suiteName,
              name: test.name,
              status: 'passed',
              duration: Date.now()
            });

            for (const hook of this.afterEachHooks) {
              await hook();
            }

          } catch (error) {
            console.log(`  ❌ ${test.name}: ${error.message}`);
            failedTests++;
            
            this.testResults.push({
              suite: suiteName,
              name: test.name,
              status: 'failed',
              error: error.message,
              stack: error.stack,
              duration: Date.now()
            });
          }
        }
      }

      for (const hook of this.afterAllHooks) {
        await hook();
      }

    } catch (error) {
      console.error('Critical error during test execution:', error);
    }

    console.log(`\n📊 Test Summary:`);
    console.log(`   Total: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: (passedTests / totalTests) * 100,
      results: this.testResults
    };
  }

  async assertEntityExists(entityClass, conditions) {
    const results = await this.base44.entities[entityClass.name].filter(conditions);
    if (results.length === 0) {
      throw new Error(`Expected entity ${entityClass.name} to exist with conditions ${JSON.stringify(conditions)}`);
    }
    return results[0];
  }

  async assertEntityDoesNotExist(entityClass, conditions) {
    const results = await this.base44.entities[entityClass.name].filter(conditions);
    if (results.length > 0) {
      throw new Error(`Expected entity ${entityClass.name} to not exist with conditions ${JSON.stringify(conditions)}`);
    }
  }

  async assertProfileHasMotivation(userId, motivationLabel) {
    const profiles = await this.base44.entities.UserPsychographicProfile.filter({
      user_id: userId
    });
    
    if (!profiles[0]) {
      throw new Error(`Profile for user ${userId} should exist`);
    }
    
    const hasMotivation = profiles[0].motivation_stack_v2?.some(m => m.label === motivationLabel) ||
                         profiles[0].motivation_stack?.includes(motivationLabel);
    
    if (!hasMotivation) {
      throw new Error(`Profile should have motivation: ${motivationLabel}`);
    }
  }

  async assertInsightGenerated(userId, insightType) {
    const insights = await this.base44.entities.PsychographicInsight.filter({
      user_id: userId,
      insight_type: insightType
    });
    
    if (insights.length === 0) {
      throw new Error(`Expected insight of type ${insightType} for user ${userId}`);
    }
    return insights[0];
  }

  createMockRequest(options = {}) {
    const url = options.url || 'https://test.example.com/';
    const method = options.method || 'GET';
    const headers = new Headers(options.headers || {});
    const body = options.body || null;

    return {
      url,
      method,
      headers,
      body,
      json: async () => options.jsonBody || {},
      text: async () => options.textBody || '',
      formData: async () => options.formData || new FormData()
    };
  }

  createMockBase44Client() {
    return {
      entities: {
        UserPsychographicProfile: {
          create: async (data) => ({ id: 'mock_id', ...data }),
          update: async (id, data) => ({ id, ...data }),
          filter: async () => [],
          delete: async () => true
        }
      }
    };
  }

  async benchmarkFunction(functionToTest, iterations = 100) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await functionToTest();
      const end = performance.now();
      results.push(end - start);
    }

    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);
    const p95 = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)];

    return {
      average: avg,
      minimum: min,
      maximum: max,
      p95: p95,
      iterations: iterations
    };
  }
}

export const testFramework = new TestFramework();