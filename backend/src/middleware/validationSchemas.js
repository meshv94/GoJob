import Joi from "joi";

// Group validation schemas
export const groupSchemas = {
  // Create group schema
  createGroup: Joi.object({
    name: Joi.string().required().min(1).max(100).messages({
      'string.empty': 'Group name cannot be empty',
      'string.min': 'Group name must be at least 1 character long',
      'string.max': 'Group name cannot exceed 100 characters'
    }),
    emails: Joi.array().items(
      Joi.object({
        email: Joi.string().email().required().messages({
          'string.email': 'Invalid email format',
          'any.required': 'Email is required'
        })
      })
    ).min(1).max(1000).required().messages({
      'array.min': 'Group must have at least 1 email',
      'array.max': 'Group cannot have more than 1000 emails'
    }),
    minEmails: Joi.number().integer().min(1).max(1000).default(1),
    maxEmails: Joi.number().integer().min(1).max(1000).default(1000),
    tags: Joi.array().items(Joi.string()).default([]),
    description: Joi.string().max(500).optional().allow('')
  }),

  // Update group schema (all fields optional)
  updateGroup: Joi.object({
    name: Joi.string().min(1).max(100).optional().messages({
      'string.empty': 'Group name cannot be empty',
      'string.min': 'Group name must be at least 1 character long',
      'string.max': 'Group name cannot exceed 100 characters'
    }),
    emails: Joi.array().items(
      Joi.object({
        email: Joi.string().email().required().messages({
          'string.email': 'Invalid email format',
          'any.required': 'Email is required'
        })
      })
    ).min(1).max(1000).optional().messages({
      'array.min': 'Group must have at least 1 email',
      'array.max': 'Group cannot have more than 1000 emails'
    }),
    minEmails: Joi.number().integer().min(1).max(1000).optional(),
    maxEmails: Joi.number().integer().min(1).max(1000).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().max(500).optional().allow('')
  }),

  // Add emails schema
  addEmails: Joi.object({
    emails: Joi.array().items(
      Joi.object({
        email: Joi.string().email().required().messages({
          'string.email': 'Invalid email format',
          'any.required': 'Email is required'
        })
      })
    ).min(1).max(1000).required().messages({
      'array.empty': 'Emails array cannot be empty',
      'array.min': 'At least one email must be provided',
      'array.max': 'Cannot add more than 1000 emails at once'
    })
  }),

  // Remove emails schema
  removeEmails: Joi.object({
    emailIds: Joi.array().items(
      Joi.number().integer().min(0).messages({
        'number.base': 'Email ID must be a number',
        'number.integer': 'Email ID must be an integer',
        'number.min': 'Email ID cannot be negative'
      })
    ).min(1).required().messages({
      'array.empty': 'Email IDs array cannot be empty',
      'array.min': 'At least one email ID must be provided',
      'any.required': 'Email IDs array is required'
    })
  })
};

// User validation schemas (for future use)
export const userSchemas = {
  // Add user-related schemas here when needed
};

// Email validation schemas (for future use)
export const emailSchemas = {
  // Add email-related schemas here when needed
};
