# Validation Middleware

This directory contains validation middleware using Joi schemas for request validation.

## Files

- `validate.js` - Main validation middleware functions
- `validationSchemas.js` - Joi validation schemas for different entities
- `README.md` - This documentation file

## Usage

### 1. Using Pre-built Validation Middleware

```javascript
import { validateGroup } from '../middleware/validate.js';

// In your routes
router.post('/groups', auth, validateGroup.create, Groups.createGroup);
router.put('/groups/:id', auth, validateGroup.update, Groups.updateGroupById);
router.post('/groups/:id/emails', auth, validateGroup.addEmails, Groups.addEmailsInToGroup);
router.delete('/groups/:id/emails', auth, validateGroup.removeEmails, Groups.removeEmailsFromGroup);
```

### 2. Using Generic Validation Middleware

```javascript
import { validate, customValidate } from '../middleware/validate.js';
import { groupSchemas } from './validationSchemas.js';

// Validate request body
router.post('/custom', auth, validate(groupSchemas.createGroup, 'body'), controller.method);

// Validate query parameters
router.get('/search', auth, validate(searchSchema, 'query'), controller.search);

// Validate URL parameters
router.get('/:id', auth, validate(idSchema, 'params'), controller.getById);
```

### 3. Creating Custom Validation Schemas

```javascript
// In validationSchemas.js
export const customSchemas = {
  search: Joi.object({
    query: Joi.string().min(1).max(100).required(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1)
  })
};

// In your routes
import { customValidate } from '../middleware/validate.js';
import { customSchemas } from './validationSchemas.js';

router.get('/search', auth, customValidate(customSchemas.search, 'query'), controller.search);
```

## Validation Options

The middleware uses these Joi options by default:

- `abortEarly: false` - Collects all validation errors instead of stopping at the first one
- `stripUnknown: true` - Removes fields not defined in the schema
- `allowUnknown: false` - Rejects unknown fields

## Response Format

### Success
The middleware passes control to the next handler with validated data.

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Group name cannot be empty",
    "Invalid email format"
  ]
}
```

## Adding New Schemas

1. Add your schema to `validationSchemas.js`
2. Export it from the appropriate section (groupSchemas, userSchemas, etc.)
3. Use it in your routes with the validation middleware

## Benefits

- **Centralized validation**: All validation logic in one place
- **Reusable**: Same schemas can be used across different endpoints
- **Consistent**: Standardized error response format
- **Maintainable**: Easy to update validation rules
- **Type-safe**: Joi handles type conversion and validation
- **Performance**: Validation happens before reaching controllers
