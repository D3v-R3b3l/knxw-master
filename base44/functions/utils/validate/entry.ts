/**
 * Simple validation utility inspired by Zod
 * Validates objects against JSON Schema-like definitions
 */

export function validateInput(data, schema) {
  const errors = [];
  
  try {
    const result = validateValue(data, schema, 'root', errors);
    
    return {
      valid: errors.length === 0,
      errors,
      data: errors.length === 0 ? result : data
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Validation error: ${error.message}`],
      data
    };
  }
}

function validateValue(value, schema, path, errors) {
  // Handle null/undefined
  if (value === null || value === undefined) {
    if (schema.required && !schema.required.includes(path.split('.').pop())) {
      return schema.default !== undefined ? schema.default : value;
    }
    if (schema.required && schema.required.includes(path.split('.').pop())) {
      errors.push(`${path} is required`);
      return value;
    }
    return schema.default !== undefined ? schema.default : value;
  }

  // Type validation
  if (schema.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    
    if (schema.type !== actualType) {
      errors.push(`${path} should be ${schema.type}, got ${actualType}`);
      return value;
    }
  }

  // Enum validation
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path} should be one of: ${schema.enum.join(', ')}`);
    return value;
  }

  // String validations
  if (schema.type === 'string') {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push(`${path} should be at least ${schema.minLength} characters`);
    }
    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push(`${path} should be at most ${schema.maxLength} characters`);
    }
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push(`${path} does not match required pattern`);
      }
    }
    if (schema.format === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${path} should be a valid email address`);
      }
    }
    if (schema.format === 'date-time') {
      if (isNaN(Date.parse(value))) {
        errors.push(`${path} should be a valid ISO date-time string`);
      }
    }
  }

  // Number validations
  if (schema.type === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${path} should be >= ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${path} should be <= ${schema.maximum}`);
    }
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) {
      errors.push(`${path} should be > ${schema.exclusiveMinimum}`);
    }
    if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) {
      errors.push(`${path} should be < ${schema.exclusiveMaximum}`);
    }
  }

  // Array validation
  if (schema.type === 'array') {
    if (schema.minItems && value.length < schema.minItems) {
      errors.push(`${path} should have at least ${schema.minItems} items`);
    }
    if (schema.maxItems && value.length > schema.maxItems) {
      errors.push(`${path} should have at most ${schema.maxItems} items`);
    }
    if (schema.items) {
      return value.map((item, index) => 
        validateValue(item, schema.items, `${path}[${index}]`, errors)
      );
    }
  }

  // Object validation
  if (schema.type === 'object' && schema.properties) {
    const result = { ...value };
    
    // Validate required fields
    if (schema.required) {
      for (const requiredField of schema.required) {
        if (!(requiredField in value)) {
          errors.push(`${path}.${requiredField} is required`);
        }
      }
    }

    // Validate each property
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in value) {
        result[key] = validateValue(value[key], propSchema, `${path}.${key}`, errors);
      } else if (propSchema.default !== undefined) {
        result[key] = propSchema.default;
      }
    }

    // Check for additional properties
    if (schema.additionalProperties === false) {
      for (const key in value) {
        if (!(key in schema.properties)) {
          errors.push(`${path}.${key} is not allowed`);
        }
      }
    }

    return result;
  }

  return value;
}

// Common validation schemas
export const commonSchemas = {
  email: {
    type: 'string',
    format: 'email'
  },
  
  uuid: {
    type: 'string',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  },
  
  timestamp: {
    type: 'string',
    format: 'date-time'
  },
  
  paginationParams: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 200,
        default: 50
      },
      offset: {
        type: 'number',
        minimum: 0,
        default: 0
      }
    }
  },
  
  eventPayload: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      element: { type: 'string' },
      coordinates: {
        type: 'object',
        properties: {
          x: { type: 'number' },
          y: { type: 'number' }
        }
      },
      duration: { type: 'number' },
      value: { type: 'string' }
    },
    additionalProperties: true
  }
};