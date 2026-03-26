// Input validation utilities using built-in JavaScript validation

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export const validators = {
  required: (value, fieldName) => {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    return value;
  },

  string: (value, fieldName) => {
    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`, fieldName);
    }
    return value;
  },

  number: (value, fieldName, { min, max } = {}) => {
    const num = Number(value);
    if (isNaN(num)) {
      throw new ValidationError(`${fieldName} must be a number`, fieldName);
    }
    if (min !== undefined && num < min) {
      throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
    }
    if (max !== undefined && num > max) {
      throw new ValidationError(`${fieldName} must be at most ${max}`, fieldName);
    }
    return num;
  },

  boolean: (value, fieldName) => {
    if (typeof value !== 'boolean') {
      throw new ValidationError(`${fieldName} must be a boolean`, fieldName);
    }
    return value;
  },

  email: (value, fieldName) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError(`${fieldName} must be a valid email`, fieldName);
    }
    return value;
  },

  array: (value, fieldName, { minLength, maxLength } = {}) => {
    if (!Array.isArray(value)) {
      throw new ValidationError(`${fieldName} must be an array`, fieldName);
    }
    if (minLength !== undefined && value.length < minLength) {
      throw new ValidationError(`${fieldName} must have at least ${minLength} items`, fieldName);
    }
    if (maxLength !== undefined && value.length > maxLength) {
      throw new ValidationError(`${fieldName} must have at most ${maxLength} items`, fieldName);
    }
    return value;
  },

  oneOf: (value, fieldName, allowedValues) => {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, fieldName);
    }
    return value;
  },

  userId: (value, fieldName) => {
    validators.required(value, fieldName);
    validators.string(value, fieldName);
    if (value.length < 3 || value.length > 50) {
      throw new ValidationError(`${fieldName} must be between 3 and 50 characters`, fieldName);
    }
    return value;
  },

  confidenceScore: (value, fieldName) => {
    return validators.number(value, fieldName, { min: 0, max: 1 });
  },

  dateString: (value, fieldName) => {
    validators.string(value, fieldName);
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`${fieldName} must be a valid ISO date string`, fieldName);
    }
    return value;
  }
};

export const validateRequest = (data, schema) => {
  const validated = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    try {
      let processedValue = value;
      
      for (const rule of rules) {
        if (typeof rule === 'function') {
          processedValue = rule(processedValue, field);
        } else if (typeof rule === 'object') {
          const { validator, options } = rule;
          processedValue = validator(processedValue, field, options);
        }
      }
      
      validated[field] = processedValue;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(`Validation failed for ${field}: ${error.message}`, field);
    }
  }
  
  return validated;
};

// Common validation schemas
export const commonSchemas = {
  userProfile: {
    user_id: [validators.required, validators.userId],
    confidence_score: [validators.confidenceScore]
  },
  
  pagination: {
    limit: [(value) => value === undefined ? 50 : validators.number(value, 'limit', { min: 1, max: 1000 })],
    offset: [(value) => value === undefined ? 0 : validators.number(value, 'offset', { min: 0 })]
  },
  
  psychographicProfile: {
    user_id: [validators.required, validators.userId],
    risk_profile: [(value) => validators.oneOf(value, 'risk_profile', ['conservative', 'moderate', 'aggressive'])],
    cognitive_style: [(value) => validators.oneOf(value, 'cognitive_style', ['analytical', 'intuitive', 'systematic', 'creative'])]
  }
};