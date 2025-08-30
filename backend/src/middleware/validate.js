import { groupSchemas, userSchemas, emailSchemas } from './validationSchemas.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      
      if (!dataToValidate) {
        return res.status(400).json({
          success: false,
          message: `No ${source} data provided for validation`
        });
      }

      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages
        });
      }

      // Replace the original data with validated data
      req[source] = value;
      next();
    } catch (err) {
      console.error('Validation middleware error:', err);
      return res.status(500).json({
        success: false,
        message: 'Validation middleware error'
      });
    }
  };
};


export const validateGroup = {
  create: validate(groupSchemas.createGroup, 'body'),
  update: validate(groupSchemas.updateGroup, 'body'),
  addEmails: validate(groupSchemas.addEmails, 'body'),
  removeEmails: validate(groupSchemas.removeEmails, 'body')
};


export const validateUser = {
  // Add user validation methods here when needed
};


export const validateEmail = {
  // Add email validation methods here when needed
};


export const customValidate = (customSchema, source = 'body') => {
  return validate(customSchema, source);
};
