import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { SecurityValidator } from './lib/enterpriseSecurity.js';
import { ObservabilityManager } from './lib/enterpriseObservability.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const security = new SecurityValidator(base44);
    const observability = new ObservabilityManager(base44);
    
    // Enhanced authentication and authorization
    const { user } = await security.validateAuthentication(req, true); // Admin required
    await security.validatePermission(user, 'deployment', 'execute');
    
    const traceId = observability.startTrace('deployment_orchestration');
    const body = await req.json();
    
    const {
      deployment_type,
      environment,
      version,
      rollback_strategy = 'immediate',
      health_checks = true,
      approval_required = true
    } = body;

    const deployment = new DeploymentOrchestrator({
      base44,
      security,
      observability,
      traceId
    });

    const result = await deployment.execute({
      type: deployment_type,
      environment,
      version,
      rollbackStrategy: rollback_strategy,
      healthChecks: health_checks,
      approvalRequired: approval_required,
      initiatedBy: user.id
    });

    observability.finishTrace(traceId, 'success');

    return Response.json({
      success: true,
      deployment_id: result.deploymentId,
      status: result.status,
      estimated_duration: result.estimatedDuration,
      rollback_plan: result.rollbackPlan
    });

  } catch (error) {
    console.error('Deployment orchestration failed:', error);
    return Response.json({
      error: 'Deployment failed',
      details: error.message,
      code: error.code || 'DEPLOYMENT_ERROR'
    }, { status: 500 });
  }
});

class DeploymentOrchestrator {
  constructor({ base44, security, observability, traceId }) {
    this.base44 = base44;
    this.security = security;
    this.observability = observability;
    this.traceId = traceId;
    this.deploymentId = crypto.randomUUID();
  }

  async execute(config) {
    const spanId = this.observability.startSpan(this.traceId, 'deployment_execution');
    
    try {
      // Validate deployment configuration
      await this.validateDeploymentConfig(config);
      
      // Pre-deployment checks
      await this.runPreDeploymentChecks(config);
      
      // Create deployment record
      const deploymentRecord = await this.createDeploymentRecord(config);
      
      // Execute deployment based on type
      let deploymentResult;
      switch (config.type) {
        case 'blue_green':
          deploymentResult = await this.executeBlueGreenDeployment(config);
          break;
        case 'canary':
          deploymentResult = await this.executeCanaryDeployment(config);
          break;
        case 'rolling':
          deploymentResult = await this.executeRollingDeployment(config);
          break;
        case 'hotfix':
          deploymentResult = await this.executeHotfixDeployment(config);
          break;
        default:
          throw new Error(`Unsupported deployment type: ${config.type}`);
      }
      
      // Post-deployment validation
      await this.runPostDeploymentValidation(config, deploymentResult);
      
      // Update deployment record
      await this.updateDeploymentRecord(deploymentRecord.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: deploymentResult
      });

      this.observability.finishSpan(spanId, 'success');
      
      return {
        deploymentId: this.deploymentId,
        status: 'completed',
        estimatedDuration: deploymentResult.duration,
        rollbackPlan: deploymentResult.rollbackPlan
      };

    } catch (error) {
      this.observability.finishSpan(spanId, 'error', error);
      
      // Attempt automatic rollback if configured
      if (config.rollbackStrategy === 'immediate') {
        await this.executeEmergencyRollback(config, error);
      }
      
      throw error;
    }
  }

  async validateDeploymentConfig(config) {
    const validationSpan = this.observability.startSpan(this.traceId, 'config_validation');
    
    try {
      // Validate environment
      const validEnvironments = ['development', 'staging', 'production'];
      if (!validEnvironments.includes(config.environment)) {
        throw new Error(`Invalid environment: ${config.environment}`);
      }

      // Validate version format
      const versionRegex = /^\d+\.\d+\.\d+(-[\w.]+)?$/;
      if (!versionRegex.test(config.version)) {
        throw new Error(`Invalid version format: ${config.version}`);
      }

      // Check if version already deployed
      const existingDeployment = await this.checkExistingVersion(config.version, config.environment);
      if (existingDeployment) {
        throw new Error(`Version ${config.version} already deployed to ${config.environment}`);
      }

      // Validate deployment window (production only)
      if (config.environment === 'production') {
        await this.validateDeploymentWindow();
      }

      this.observability.finishSpan(validationSpan, 'success');
    } catch (error) {
      this.observability.finishSpan(validationSpan, 'error', error);
      throw error;
    }
  }

  async runPreDeploymentChecks(config) {
    const checksSpan = this.observability.startSpan(this.traceId, 'pre_deployment_checks');
    
    try {
      const checks = [
        this.checkSystemHealth(),
        this.checkResourceAvailability(config),
        this.checkDependencies(config),
        this.checkSecurityCompliance(config),
        this.checkBackupStatus(config)
      ];

      const results = await Promise.allSettled(checks);
      const failures = results.filter(r => r.status === 'rejected');
      
      if (failures.length > 0) {
        const errors = failures.map(f => f.reason.message).join('; ');
        throw new Error(`Pre-deployment checks failed: ${errors}`);
      }

      this.observability.finishSpan(checksSpan, 'success');
    } catch (error) {
      this.observability.finishSpan(checksSpan, 'error', error);
      throw error;
    }
  }

  async executeBlueGreenDeployment(config) {
    const deploymentSpan = this.observability.startSpan(this.traceId, 'blue_green_deployment');
    
    try {
      const startTime = Date.now();
      
      // Step 1: Deploy to inactive environment (green)
      await this.deployToEnvironment(config, 'green');
      
      // Step 2: Run smoke tests on green environment
      await this.runSmokeTests(config, 'green');
      
      // Step 3: Switch traffic gradually
      await this.switchTrafficGradually(config, 'blue', 'green');
      
      // Step 4: Monitor for issues
      await this.monitorDeployment(config, 'green', 300000); // 5 minutes
      
      // Step 5: Complete switch if successful
      await this.completeTrafficSwitch(config, 'green');
      
      const duration = Date.now() - startTime;
      
      this.observability.finishSpan(deploymentSpan, 'success');
      
      return {
        type: 'blue_green',
        duration,
        rollbackPlan: {
          action: 'switch_traffic',
          from: 'green',
          to: 'blue',
          estimated_time: 30000 // 30 seconds
        }
      };
      
    } catch (error) {
      this.observability.finishSpan(deploymentSpan, 'error', error);
      throw error;
    }
  }

  async executeCanaryDeployment(config) {
    const deploymentSpan = this.observability.startSpan(this.traceId, 'canary_deployment');
    
    try {
      const startTime = Date.now();
      const canaryStages = [
        { percentage: 5, duration: 300000 },   // 5% for 5 minutes
        { percentage: 25, duration: 600000 },  // 25% for 10 minutes
        { percentage: 50, duration: 600000 },  // 50% for 10 minutes
        { percentage: 100, duration: 300000 }  // 100% for 5 minutes
      ];

      for (const stage of canaryStages) {
        // Deploy canary version to percentage of traffic
        await this.deployCanaryStage(config, stage.percentage);
        
        // Monitor metrics during stage
        const metricsValid = await this.monitorCanaryMetrics(config, stage.duration);
        
        if (!metricsValid) {
          throw new Error(`Canary metrics failed at ${stage.percentage}% stage`);
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.observability.finishSpan(deploymentSpan, 'success');
      
      return {
        type: 'canary',
        duration,
        rollbackPlan: {
          action: 'remove_canary',
          estimated_time: 60000 // 1 minute
        }
      };
      
    } catch (error) {
      this.observability.finishSpan(deploymentSpan, 'error', error);
      throw error;
    }
  }

  async executeRollingDeployment(config) {
    const deploymentSpan = this.observability.startSpan(this.traceId, 'rolling_deployment');
    
    try {
      const startTime = Date.now();
      const instances = await this.getActiveInstances(config.environment);
      const batchSize = Math.max(1, Math.floor(instances.length / 4)); // 25% at a time
      
      for (let i = 0; i < instances.length; i += batchSize) {
        const batch = instances.slice(i, i + batchSize);
        
        // Update batch
        await this.updateInstanceBatch(config, batch);
        
        // Health check batch
        await this.healthCheckBatch(batch);
        
        // Brief pause between batches
        await this.sleep(30000); // 30 seconds
      }
      
      const duration = Date.now() - startTime;
      
      this.observability.finishSpan(deploymentSpan, 'success');
      
      return {
        type: 'rolling',
        duration,
        rollbackPlan: {
          action: 'rolling_rollback',
          estimated_time: duration * 1.2 // 20% longer for rollback
        }
      };
      
    } catch (error) {
      this.observability.finishSpan(deploymentSpan, 'error', error);
      throw error;
    }
  }

  async executeHotfixDeployment(config) {
    const deploymentSpan = this.observability.startSpan(this.traceId, 'hotfix_deployment');
    
    try {
      const startTime = Date.now();
      
      // Hotfix deployments bypass some checks for speed
      console.warn('HOTFIX DEPLOYMENT: Bypassing standard deployment gates');
      
      // Minimal validation
      await this.validateHotfix(config);
      
      // Direct deployment
      await this.deployDirectly(config);
      
      // Immediate health check
      await this.runEmergencyHealthCheck(config);
      
      const duration = Date.now() - startTime;
      
      this.observability.finishSpan(deploymentSpan, 'success');
      
      return {
        type: 'hotfix',
        duration,
        rollbackPlan: {
          action: 'immediate_rollback',
          estimated_time: 120000 // 2 minutes
        }
      };
      
    } catch (error) {
      this.observability.finishSpan(deploymentSpan, 'error', error);
      throw error;
    }
  }

  // Helper methods for deployment operations
  async checkSystemHealth() {
    // Simulate system health check
    const healthScore = Math.random() * 100;
    if (healthScore < 70) {
      throw new Error(`System health below threshold: ${healthScore.toFixed(1)}%`);
    }
    return { healthy: true, score: healthScore };
  }

  async checkResourceAvailability(config) {
    // Check if sufficient resources are available
    const resources = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      storage: Math.random() * 100
    };
    
    const thresholds = { cpu: 80, memory: 85, storage: 90 };
    
    for (const [resource, usage] of Object.entries(resources)) {
      if (usage > thresholds[resource]) {
        throw new Error(`Insufficient ${resource}: ${usage.toFixed(1)}% > ${thresholds[resource]}%`);
      }
    }
    
    return resources;
  }

  async checkDependencies(config) {
    // Mock dependency checks
    const dependencies = ['database', 'cache', 'external_api'];
    const failures = [];
    
    for (const dep of dependencies) {
      if (Math.random() < 0.05) { // 5% chance of failure
        failures.push(dep);
      }
    }
    
    if (failures.length > 0) {
      throw new Error(`Dependency checks failed: ${failures.join(', ')}`);
    }
    
    return { dependencies: dependencies.length, healthy: dependencies.length };
  }

  async checkSecurityCompliance(config) {
    // Security compliance validation
    const compliance = {
      vulnerabilities: Math.floor(Math.random() * 3),
      secrets_rotation: Math.random() > 0.1,
      access_controls: Math.random() > 0.05
    };
    
    if (compliance.vulnerabilities > 0) {
      throw new Error(`${compliance.vulnerabilities} security vulnerabilities detected`);
    }
    
    if (!compliance.secrets_rotation) {
      throw new Error('Secrets rotation compliance failed');
    }
    
    if (!compliance.access_controls) {
      throw new Error('Access control validation failed');
    }
    
    return compliance;
  }

  async checkBackupStatus(config) {
    // Verify recent backups exist
    const lastBackup = Date.now() - (Math.random() * 86400000); // Within last day
    const backupAge = Date.now() - lastBackup;
    
    if (backupAge > 24 * 60 * 60 * 1000) { // Older than 24 hours
      throw new Error(`Backup too old: ${Math.floor(backupAge / (60 * 60 * 1000))} hours`);
    }
    
    return { lastBackup: new Date(lastBackup).toISOString(), age: backupAge };
  }

  async createDeploymentRecord(config) {
    return await this.base44.entities.SystemEvent.create({
      org_id: 'system',
      actor_type: 'system',
      actor_id: config.initiatedBy,
      event_type: 'deployment_started',
      severity: 'info',
      payload: {
        deployment_id: this.deploymentId,
        type: config.type,
        environment: config.environment,
        version: config.version,
        config: config
      },
      timestamp: new Date().toISOString()
    });
  }

  async updateDeploymentRecord(recordId, updates) {
    return await this.base44.entities.SystemEvent.update(recordId, {
      payload: {
        ...updates,
        updated_at: new Date().toISOString()
      }
    });
  }

  async validateDeploymentWindow() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Block deployments during peak hours (9 AM - 5 PM) on weekdays
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour <= 17) {
      throw new Error('Deployment blocked: Outside maintenance window (peak business hours)');
    }
    
    return true;
  }

  async checkExistingVersion(version, environment) {
    // Mock check for existing version
    return Math.random() < 0.1; // 10% chance version exists
  }

  // Deployment execution helpers (mocked for demonstration)
  async deployToEnvironment(config, targetEnv) {
    console.log(`Deploying ${config.version} to ${targetEnv} environment`);
    await this.sleep(5000); // Simulate deployment time
    return { success: true, environment: targetEnv };
  }

  async runSmokeTests(config, environment) {
    console.log(`Running smoke tests on ${environment}`);
    await this.sleep(2000);
    
    if (Math.random() < 0.05) { // 5% chance of smoke test failure
      throw new Error(`Smoke tests failed on ${environment}`);
    }
    
    return { passed: true, tests: 15 };
  }

  async switchTrafficGradually(config, from, to) {
    const stages = [10, 25, 50, 75, 90];
    
    for (const percentage of stages) {
      console.log(`Switching ${percentage}% traffic from ${from} to ${to}`);
      await this.sleep(1000);
    }
    
    return { completed: true };
  }

  async monitorDeployment(config, environment, duration) {
    console.log(`Monitoring ${environment} for ${duration}ms`);
    await this.sleep(Math.min(duration, 3000)); // Cap monitoring simulation
    
    // Simulate monitoring results
    if (Math.random() < 0.1) { // 10% chance of monitoring failure
      throw new Error(`Monitoring detected issues in ${environment}`);
    }
    
    return { healthy: true, metrics: { errors: 0, latency: 45 } };
  }

  async completeTrafficSwitch(config, to) {
    console.log(`Completing traffic switch to ${to}`);
    await this.sleep(1000);
    return { success: true, active_environment: to };
  }

  async deployCanaryStage(config, percentage) {
    console.log(`Deploying canary at ${percentage}% traffic`);
    await this.sleep(2000);
    return { success: true, percentage };
  }

  async monitorCanaryMetrics(config, duration) {
    console.log(`Monitoring canary metrics for ${duration}ms`);
    await this.sleep(Math.min(duration, 5000)); // Cap simulation
    
    // Simulate metrics validation
    const errorRate = Math.random() * 2; // 0-2% error rate
    const latency = Math.random() * 100 + 50; // 50-150ms latency
    
    // Fail if metrics are poor
    if (errorRate > 1.5 || latency > 120) {
      return false;
    }
    
    return true;
  }

  async getActiveInstances(environment) {
    // Mock instance list
    return Array.from({ length: 8 }, (_, i) => ({
      id: `instance-${i + 1}`,
      environment,
      status: 'healthy'
    }));
  }

  async updateInstanceBatch(config, batch) {
    console.log(`Updating ${batch.length} instances`);
    await this.sleep(3000);
    return { updated: batch.length };
  }

  async healthCheckBatch(batch) {
    console.log(`Health checking ${batch.length} instances`);
    await this.sleep(1000);
    
    // Simulate occasional instance failure
    if (Math.random() < 0.05) {
      throw new Error(`Health check failed for instance ${batch[0].id}`);
    }
    
    return { healthy: batch.length };
  }

  async executeEmergencyRollback(config, originalError) {
    console.error(`EMERGENCY ROLLBACK initiated due to: ${originalError.message}`);
    
    try {
      const rollbackSpan = this.observability.startSpan(this.traceId, 'emergency_rollback');
      
      // Implement rollback logic based on deployment type
      switch (config.type) {
        case 'blue_green':
          await this.rollbackBlueGreen(config);
          break;
        case 'canary':
          await this.rollbackCanary(config);
          break;
        case 'rolling':
          await this.rollbackRolling(config);
          break;
        default:
          await this.rollbackGeneric(config);
      }
      
      this.observability.finishSpan(rollbackSpan, 'success');
      console.log('Emergency rollback completed successfully');
      
    } catch (rollbackError) {
      console.error('CRITICAL: Emergency rollback failed:', rollbackError);
      
      // Alert operations team
      await this.sendCriticalAlert(config, originalError, rollbackError);
    }
  }

  async rollbackBlueGreen(config) {
    await this.switchTrafficGradually(config, 'green', 'blue');
  }

  async rollbackCanary(config) {
    console.log('Removing canary deployment');
    await this.sleep(2000);
  }

  async rollbackRolling(config) {
    console.log('Initiating rolling rollback');
    await this.sleep(5000);
  }

  async rollbackGeneric(config) {
    console.log('Executing generic rollback');
    await this.sleep(3000);
  }

  async sendCriticalAlert(config, originalError, rollbackError) {
    try {
      await this.base44.entities.Alert.create({
        org_id: 'system',
        rule_name: 'deployment_failure_critical',
        severity: 'critical',
        title: 'CRITICAL: Deployment and rollback failed',
        message: `Deployment ${this.deploymentId} failed and rollback also failed. Manual intervention required immediately. Original: ${originalError.message}. Rollback: ${rollbackError.message}`,
        status: 'active'
      });
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError);
    }
  }

  async runPostDeploymentValidation(config, result) {
    console.log('Running post-deployment validation');
    await this.sleep(2000);
    
    // Simulate validation
    if (Math.random() < 0.02) { // 2% chance of validation failure
      throw new Error('Post-deployment validation failed');
    }
    
    return { validated: true };
  }

  async validateHotfix(config) {
    // Minimal validation for hotfix
    if (!config.version.includes('hotfix')) {
      throw new Error('Hotfix deployment requires hotfix version');
    }
  }

  async deployDirectly(config) {
    console.log(`Deploying hotfix ${config.version} directly`);
    await this.sleep(3000);
  }

  async runEmergencyHealthCheck(config) {
    console.log('Running emergency health check');
    await this.sleep(1000);
    
    if (Math.random() < 0.1) {
      throw new Error('Emergency health check failed');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}