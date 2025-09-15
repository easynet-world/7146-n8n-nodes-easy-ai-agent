import { NodeOperationError } from 'n8n-workflow';

/**
 * Validates JSON schemas for n8n tool execution
 */
export class N8nSchemaValidator {
  
  /**
   * Validate MCP tool arguments against schema
   */
  static validateMCPToolArgs(toolName: string, args: any, schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema || !schema.properties) {
      return { valid: true, errors: [] }; // No schema to validate against
    }

    // Check required fields
    if (schema.required) {
      for (const requiredField of schema.required) {
        if (args[requiredField] === undefined || args[requiredField] === null || args[requiredField] === '') {
          errors.push(`Required field '${requiredField}' is missing or empty`);
        }
      }
    }

    // Validate each provided field
    for (const [fieldName, fieldValue] of Object.entries(args)) {
      const fieldSchema = schema.properties[fieldName];
      if (!fieldSchema) {
        errors.push(`Unknown field '${fieldName}' for tool '${toolName}'`);
        continue;
      }

      const fieldError = this.validateField(fieldName, fieldValue, fieldSchema);
      if (fieldError) {
        errors.push(fieldError);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a single field against its schema
   */
  private static validateField(fieldName: string, value: any, schema: any): string | null {
    // Type validation
    if (schema.type === 'string' && typeof value !== 'string') {
      return `Field '${fieldName}' must be a string`;
    }

    if (schema.type === 'number' && typeof value !== 'number') {
      return `Field '${fieldName}' must be a number`;
    }

    if (schema.type === 'integer' && (!Number.isInteger(value) || typeof value !== 'number')) {
      return `Field '${fieldName}' must be an integer`;
    }

    if (schema.type === 'boolean' && typeof value !== 'boolean') {
      return `Field '${fieldName}' must be a boolean`;
    }

    if (schema.type === 'array' && !Array.isArray(value)) {
      return `Field '${fieldName}' must be an array`;
    }

    if (schema.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
      return `Field '${fieldName}' must be an object`;
    }

    // String validations
    if (schema.type === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        return `Field '${fieldName}' must be at least ${schema.minLength} characters long`;
      }

      if (schema.maxLength && value.length > schema.maxLength) {
        return `Field '${fieldName}' must be no more than ${schema.maxLength} characters long`;
      }

      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        return `Field '${fieldName}' does not match required pattern`;
      }

      if (schema.enum && !schema.enum.includes(value)) {
        return `Field '${fieldName}' must be one of: ${schema.enum.join(', ')}`;
      }

      if (schema.format === 'uri' && !this.isValidUrl(value)) {
        return `Field '${fieldName}' must be a valid URL`;
      }

      if (schema.format === 'email' && !this.isValidEmail(value)) {
        return `Field '${fieldName}' must be a valid email address`;
      }
    }

    // Number validations
    if (schema.type === 'number' || schema.type === 'integer') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        return `Field '${fieldName}' must be at least ${schema.minimum}`;
      }

      if (schema.maximum !== undefined && value > schema.maximum) {
        return `Field '${fieldName}' must be no more than ${schema.maximum}`;
      }
    }

    // Array validations
    if (schema.type === 'array') {
      if (schema.minItems && value.length < schema.minItems) {
        return `Field '${fieldName}' must have at least ${schema.minItems} items`;
      }

      if (schema.maxItems && value.length > schema.maxItems) {
        return `Field '${fieldName}' must have no more than ${schema.maxItems} items`;
      }

      if (schema.items) {
        for (let i = 0; i < value.length; i++) {
          const itemError = this.validateField(`${fieldName}[${i}]`, value[i], schema.items);
          if (itemError) {
            return itemError;
          }
        }
      }
    }

    return null;
  }

  /**
   * Check if a string is a valid URL
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a string is a valid email
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate and sanitize MCP tool arguments
   */
  static validateAndSanitizeMCPToolArgs(toolName: string, args: any, schema: any): any {
    const validation = this.validateMCPToolArgs(toolName, args, schema);
    
    if (!validation.valid) {
      throw new NodeOperationError(
        null,
        `Invalid arguments for tool '${toolName}': ${validation.errors.join(', ')}`
      );
    }

    // Sanitize arguments
    const sanitizedArgs = { ...args };

    // Remove undefined values
    for (const key in sanitizedArgs) {
      if (sanitizedArgs[key] === undefined) {
        delete sanitizedArgs[key];
      }
    }

    // Apply defaults
    if (schema && schema.properties) {
      for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
        const field = fieldSchema as any;
        if (field.default !== undefined && sanitizedArgs[fieldName] === undefined) {
          sanitizedArgs[fieldName] = field.default;
        }
      }
    }

    return sanitizedArgs;
  }

  /**
   * Get validation errors for display in n8n
   */
  static getValidationErrors(toolName: string, args: any, schema: any): string[] {
    const validation = this.validateMCPToolArgs(toolName, args, schema);
    return validation.errors.map(error => `Tool '${toolName}': ${error}`);
  }
}
