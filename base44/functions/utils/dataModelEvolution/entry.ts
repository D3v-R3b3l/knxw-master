// Data model evolution and migration utilities
import { createClient } from 'npm:@base44/sdk@0.7.1';

export const SCHEMA_VERSIONS = {
  V1_0_0: 'v1.0.0',
  V1_1_0: 'v1.1.0', 
  V1_2_0: 'v1.2.0',
  V1_3_0: 'v1.3.0'
};

export const CURRENT_SCHEMA_VERSION = SCHEMA_VERSIONS.V1_3_0;

export class DataMigrator {
  constructor(base44Client) {
    this.base44 = base44Client;
    this.migrationLog = [];
  }

  async migrateUserPsychographicProfiles() {
    console.log('Starting UserPsychographicProfile migration...');
    
    let migratedCount = 0;
    let errorCount = 0;
    const batchSize = 100;
    let offset = 0;

    while (true) {
      try {
        const profiles = await this.base44.entities.UserPsychographicProfile.filter({
          "$or": [
            {"schema_version": {"$ne": CURRENT_SCHEMA_VERSION}},
            {"schema_version": null}
          ]
        }, null, batchSize, offset);

        if (profiles.length === 0) {
          break;
        }

        console.log(`Processing batch of ${profiles.length} profiles (offset: ${offset})`);

        for (const profile of profiles) {
          try {
            const migratedProfile = await this.migrateProfileRecord(profile);
            
            if (migratedProfile) {
              await this.base44.entities.UserPsychographicProfile.update(
                profile.id, 
                migratedProfile
              );
              migratedCount++;
            }
          } catch (error) {
            console.error(`Error migrating profile ${profile.id}:`, error);
            errorCount++;
            this.migrationLog.push({
              type: 'error',
              entityId: profile.id,
              error: error.message,
              timestamp: new Date().toISOString()
            });
          }
        }

        offset += profiles.length;
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error('Error in migration batch:', error);
        break;
      }
    }

    const summary = {
      migratedCount,
      errorCount,
      totalProcessed: migratedCount + errorCount,
      migrationLog: this.migrationLog
    };

    console.log('Migration completed:', summary);
    return summary;
  }

  async migrateProfileRecord(profile) {
    const originalVersion = profile.schema_version || 'v1.0.0';
    
    if (originalVersion === CURRENT_SCHEMA_VERSION) {
      return null;
    }

    let migratedProfile = { ...profile };

    if (this.isVersionOlder(originalVersion, SCHEMA_VERSIONS.V1_1_0)) {
      migratedProfile = await this.migrateToV1_1_0(migratedProfile);
    }

    if (this.isVersionOlder(originalVersion, SCHEMA_VERSIONS.V1_2_0)) {
      migratedProfile = await this.migrateToV1_2_0(migratedProfile);
    }

    if (this.isVersionOlder(originalVersion, SCHEMA_VERSIONS.V1_3_0)) {
      migratedProfile = await this.migrateToV1_3_0(migratedProfile);
    }

    migratedProfile.schema_version = CURRENT_SCHEMA_VERSION;

    this.migrationLog.push({
      type: 'migration',
      entityId: profile.id,
      fromVersion: originalVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
      timestamp: new Date().toISOString()
    });

    return migratedProfile;
  }

  async migrateToV1_1_0(profile) {
    return {
      ...profile,
      motivation_confidence: profile.motivation_confidence || 0.5,
      emotional_state_confidence: profile.emotional_state_confidence || 0.5,
      risk_profile_confidence: profile.risk_profile_confidence || 0.5
    };
  }

  async migrateToV1_2_0(profile) {
    return {
      ...profile,
      cognitive_style: profile.cognitive_style || 'analytical',
      cognitive_style_confidence: profile.cognitive_style_confidence || 0.5,
      personality_traits: profile.personality_traits || {},
      personality_confidence: profile.personality_confidence || 0.5,
      engagement_patterns: profile.engagement_patterns || {}
    };
  }

  async migrateToV1_3_0(profile) {
    const migratedProfile = { ...profile };

    if (profile.motivation_stack && !profile.motivation_stack_v2) {
      migratedProfile.motivation_stack_v2 = this.convertMotivationStack(profile.motivation_stack);
      migratedProfile.motivation_labels = profile.motivation_stack;
    }

    return {
      ...migratedProfile,
      valid_from: profile.valid_from || new Date().toISOString(),
      valid_to: profile.valid_to || null,
      staleness_score: profile.staleness_score || 0,
      provenance: profile.provenance || {},
      segment_labels: profile.segment_labels || [],
      cluster_id: profile.cluster_id || null,
      profile_reasoning: profile.profile_reasoning || {}
    };
  }

  convertMotivationStack(motivationStack) {
    if (!Array.isArray(motivationStack)) {
      return [];
    }

    const totalMotivations = motivationStack.length;
    return motivationStack.map((motivation, index) => ({
      label: motivation,
      weight: (totalMotivations - index) / totalMotivations
    }));
  }

  isVersionOlder(version1, version2) {
    const v1Parts = version1.replace('v', '').split('.').map(Number);
    const v2Parts = version2.replace('v', '').split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return true;
      if (v1Part > v2Part) return false;
    }
    
    return false;
  }

  async cleanupLegacyFields() {
    console.log('Starting cleanup of legacy fields...');
    
    const cleanupOperations = [
      {
        entity: 'UserPsychographicProfile',
        updates: {
          motivation_stack: null
        },
        conditions: {
          motivation_stack_v2: { "$ne": null },
          schema_version: CURRENT_SCHEMA_VERSION
        }
      }
    ];

    let totalCleaned = 0;

    for (const operation of cleanupOperations) {
      try {
        const records = await this.base44.entities[operation.entity].filter(
          operation.conditions,
          null,
          1000
        );

        for (const record of records) {
          await this.base44.entities[operation.entity].update(
            record.id,
            operation.updates
          );
          totalCleaned++;
        }

        console.log(`Cleaned ${records.length} ${operation.entity} records`);
      } catch (error) {
        console.error(`Error cleaning ${operation.entity}:`, error);
      }
    }

    return { totalCleaned };
  }

  async validateDataConsistency() {
    console.log('Validating data consistency...');
    
    const validationResults = {
      userProfiles: await this.validateUserProfiles(),
      capturedEvents: await this.validateCapturedEvents(),
      insights: await this.validateInsights()
    };

    return validationResults;
  }

  async validateUserProfiles() {
    const issues = [];
    
    try {
      const profiles = await this.base44.entities.UserPsychographicProfile.filter({
        schema_version: CURRENT_SCHEMA_VERSION
      }, null, 1000);

      for (const profile of profiles) {
        if (profile.motivation_stack && profile.motivation_stack_v2) {
          issues.push({
            type: 'inconsistent_motivations',
            profileId: profile.id,
            message: 'Profile has both legacy and new motivation formats'
          });
        }

        const confidenceFields = [
          'motivation_confidence',
          'emotional_state_confidence', 
          'risk_profile_confidence',
          'cognitive_style_confidence',
          'personality_confidence'
        ];

        for (const field of confidenceFields) {
          const value = profile[field];
          if (value !== null && value !== undefined && (value < 0 || value > 1)) {
            issues.push({
              type: 'invalid_confidence_score',
              profileId: profile.id,
              field: field,
              value: value,
              message: `Confidence score ${field} is out of range (0-1)`
            });
          }
        }

        if (profile.staleness_score < 0 || profile.staleness_score > 1) {
          issues.push({
            type: 'invalid_staleness_score',
            profileId: profile.id,
            value: profile.staleness_score,
            message: 'Staleness score is out of range (0-1)'
          });
        }
      }
    } catch (error) {
      console.error('Error validating user profiles:', error);
      issues.push({
        type: 'validation_error',
        error: error.message
      });
    }

    return issues;
  }

  async validateCapturedEvents() {
    const issues = [];
    
    try {
      const events = await this.base44.entities.CapturedEvent.filter({
        processed: false
      }, null, 1000);

      for (const event of events) {
        if (!event.user_id) {
          issues.push({
            type: 'missing_user_id',
            eventId: event.id,
            message: 'Event missing required user_id'
          });
        }

        if (!event.event_type) {
          issues.push({
            type: 'missing_event_type', 
            eventId: event.id,
            message: 'Event missing required event_type'
          });
        }

        if (!event.timestamp) {
          issues.push({
            type: 'missing_timestamp',
            eventId: event.id,
            message: 'Event missing required timestamp'
          });
        }
      }
    } catch (error) {
      console.error('Error validating captured events:', error);
      issues.push({
        type: 'validation_error',
        error: error.message
      });
    }

    return issues;
  }

  async validateInsights() {
    const issues = [];
    
    try {
      const insights = await this.base44.entities.PsychographicInsight.filter({}, null, 1000);

      for (const insight of insights) {
        if (insight.confidence_score < 0 || insight.confidence_score > 1) {
          issues.push({
            type: 'invalid_confidence_score',
            insightId: insight.id,
            value: insight.confidence_score,
            message: 'Insight confidence score is out of range (0-1)'
          });
        }

        if (!insight.user_id) {
          issues.push({
            type: 'missing_user_id',
            insightId: insight.id,
            message: 'Insight missing required user_id'
          });
        }
      }
    } catch (error) {
      console.error('Error validating insights:', error);
      issues.push({
        type: 'validation_error',
        error: error.message
      });
    }

    return issues;
  }
}

export function trackSchemaEvolution(entity, oldVersion, newVersion, changeDetails) {
  console.log(JSON.stringify({
    '@timestamp': new Date().toISOString(),
    type: 'schema_evolution',
    entity: entity,
    from_version: oldVersion,
    to_version: newVersion,
    changes: changeDetails,
    migration_timestamp: new Date().toISOString()
  }));
}