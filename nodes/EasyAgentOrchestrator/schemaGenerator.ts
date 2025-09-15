import { INodeProperties } from 'n8n-workflow';

/**
 * Generates n8n JSON schemas for MCP tool execution
 */
export class N8nSchemaGenerator {
  
  /**
   * Generate JSON schema for MCP tool arguments
   */
  static generateMCPToolSchema(toolName: string, toolDescription: string, toolSchema?: any): INodeProperties[] {
    const baseProperties: INodeProperties[] = [
      {
        displayName: 'Tool Name',
        name: 'toolName',
        type: 'string',
        default: toolName,
        description: `The MCP tool to execute: ${toolName}`,
        displayOptions: {
          show: {
            operation: ['executeGoal'],
            useN8nMCP: [true],
          },
        },
      },
      {
        displayName: 'Tool Description',
        name: 'toolDescription',
        type: 'string',
        default: toolDescription,
        description: 'Description of what this tool does',
        displayOptions: {
          show: {
            operation: ['executeGoal'],
            useN8nMCP: [true],
          },
        },
      },
    ];

    // Add dynamic properties based on tool schema
    if (toolSchema && toolSchema.properties) {
      const dynamicProperties = this.generateDynamicProperties(toolSchema.properties, toolName);
      baseProperties.push(...dynamicProperties);
    }

    return baseProperties;
  }

  /**
   * Generate dynamic properties from tool schema
   */
  private static generateDynamicProperties(properties: any, toolName: string): INodeProperties[] {
    const dynamicProps: INodeProperties[] = [];

    for (const [propName, propSchema] of Object.entries(properties)) {
      const schema = propSchema as any;
      
      const baseProp: INodeProperties = {
        displayName: this.formatDisplayName(propName),
        name: `toolArgs.${propName}`,
        type: this.mapSchemaTypeToN8nType(schema.type) as any,
        default: schema.default || '',
        description: schema.description || `Parameter: ${propName}`,
        displayOptions: {
          show: {
            operation: ['executeGoal'],
            useN8nMCP: [true],
            toolName: [toolName],
          },
        },
      };

      // Add type-specific configurations
      if (schema.type === 'string' && schema.enum) {
        baseProp.type = 'options';
        baseProp.options = schema.enum.map((value: string) => ({
          name: value,
          value: value,
        }));
      }

      if (schema.type === 'number' || schema.type === 'integer') {
        baseProp.type = 'number';
        if (schema.minimum !== undefined) {
          (baseProp as any).typeOptions = {
            minValue: schema.minimum,
          };
        }
        if (schema.maximum !== undefined) {
          (baseProp as any).typeOptions = {
            ...(baseProp as any).typeOptions,
            maxValue: schema.maximum,
          };
        }
      }

      if (schema.type === 'boolean') {
        baseProp.type = 'boolean';
      }

      if (schema.type === 'array') {
        baseProp.type = 'fixedCollection';
        baseProp.typeOptions = {
          multipleValues: true,
        };
        baseProp.default = {};
      }

      if (schema.type === 'object') {
        baseProp.type = 'json';
        baseProp.typeOptions = {
          rows: 4,
        };
      }

      dynamicProps.push(baseProp);
    }

    return dynamicProps;
  }

  /**
   * Map JSON schema types to n8n types
   */
  private static mapSchemaTypeToN8nType(schemaType: string): string {
    const typeMap: { [key: string]: string } = {
      'string': 'string',
      'number': 'number',
      'integer': 'number',
      'boolean': 'boolean',
      'array': 'fixedCollection',
      'object': 'json',
    };

    return typeMap[schemaType] || 'string';
  }

  /**
   * Format property names for display
   */
  private static formatDisplayName(propName: string): string {
    return propName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  /**
   * Generate schema for common MCP tools
   */
  static generateCommonMCPToolSchemas(): INodeProperties[] {
    const commonTools = [
      {
        name: 'get_health',
        description: 'Check the health status of the MCP server',
        schema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'post_youtube_basic-info',
        description: 'Get basic information about a YouTube video',
        schema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'YouTube video URL',
              format: 'uri',
            },
            language: {
              type: 'string',
              description: 'Preferred language for subtitles',
              default: 'en',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'post_web-extractor_extract',
        description: 'Extract content from a web page',
        schema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to extract content from',
              format: 'uri',
            },
            selector: {
              type: 'string',
              description: 'CSS selector to extract specific content',
              default: 'body',
            },
            timeout: {
              type: 'number',
              description: 'Request timeout in seconds',
              default: 30,
              minimum: 1,
              maximum: 300,
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'post_searxng_images',
        description: 'Search for images using SearXNG',
        schema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for images',
            },
            count: {
              type: 'number',
              description: 'Number of images to return',
              default: 10,
              minimum: 1,
              maximum: 100,
            },
            safe: {
              type: 'boolean',
              description: 'Enable safe search',
              default: true,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'post_wordpress_blog',
        description: 'Create a new WordPress blog post',
        schema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Blog post title',
            },
            content: {
              type: 'string',
              description: 'Blog post content (HTML)',
            },
            status: {
              type: 'string',
              description: 'Post status',
              enum: ['draft', 'publish', 'private'],
              default: 'draft',
            },
            source_key: {
              type: 'string',
              description: 'Unique source key for deduplication',
            },
          },
          required: ['title', 'content'],
        },
      },
      {
        name: 'get_wordpress_blog',
        description: 'Retrieve a WordPress blog post',
        schema: {
          type: 'object',
          properties: {
            source_key: {
              type: 'string',
              description: 'Source key to retrieve the post',
            },
          },
          required: ['source_key'],
        },
      },
      {
        name: 'post_youtube_channel-videos',
        description: 'Get videos from a YouTube channel',
        schema: {
          type: 'object',
          properties: {
            channel_id: {
              type: 'string',
              description: 'YouTube channel ID',
            },
            max_results: {
              type: 'number',
              description: 'Maximum number of videos to return',
              default: 10,
              minimum: 1,
              maximum: 50,
            },
            order: {
              type: 'string',
              description: 'Order of results',
              enum: ['date', 'rating', 'relevance', 'title', 'videoCount', 'viewCount'],
              default: 'date',
            },
          },
          required: ['channel_id'],
        },
      },
      {
        name: 'post_youtube_subscriptions',
        description: 'Manage YouTube subscriptions',
        schema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              description: 'Action to perform',
              enum: ['list', 'subscribe', 'unsubscribe'],
              default: 'list',
            },
            channel_id: {
              type: 'string',
              description: 'YouTube channel ID (required for subscribe/unsubscribe)',
            },
          },
          required: ['action'],
        },
      },
    ];

    const allSchemas: INodeProperties[] = [];

    for (const tool of commonTools) {
      const toolSchemas = this.generateMCPToolSchema(tool.name, tool.description, tool.schema);
      allSchemas.push(...toolSchemas);
    }

    return allSchemas;
  }

  /**
   * Generate LLM configuration schema
   */
  static generateLLMConfigSchema(): INodeProperties[] {
    return [
      {
        displayName: 'LLM Provider',
        name: 'llmProvider',
        type: 'options',
        options: [
          {
            name: 'OpenRouter',
            value: 'openrouter',
          },
          {
            name: 'Ollama',
            value: 'ollama',
          },
        ],
        default: 'ollama',
        description: 'Choose the LLM provider to use',
        displayOptions: {
          show: {
            operation: ['executeGoal'],
            useN8nLLM: [true],
          },
        },
      },
      {
        displayName: 'Model',
        name: 'llmModel',
        type: 'string',
        default: 'gpt-oss-80k:latest',
        description: 'The model to use for LLM operations',
        displayOptions: {
          show: {
            operation: ['executeGoal'],
            useN8nLLM: [true],
          },
        },
      },
      {
        displayName: 'Temperature',
        name: 'llmTemperature',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 2,
          numberStepSize: 0.1,
        },
        default: 0.7,
        description: 'Temperature for LLM responses (0-2)',
        displayOptions: {
          show: {
            operation: ['executeGoal'],
            useN8nLLM: [true],
          },
        },
      },
      {
        displayName: 'Max Tokens',
        name: 'llmMaxTokens',
        type: 'number',
        default: 4000,
        description: 'Maximum tokens for LLM responses',
        displayOptions: {
          show: {
            operation: ['executeGoal'],
            useN8nLLM: [true],
          },
        },
      },
    ];
  }

  /**
   * Generate Memory configuration schema
   */
  static generateMemoryConfigSchema(): INodeProperties[] {
    return [
      {
        displayName: 'Memory Provider',
        name: 'memoryProvider',
        type: 'options',
        options: [
          {
            name: 'Redis',
            value: 'redis',
          },
          {
            name: 'Database',
            value: 'database',
          },
        ],
        default: 'redis',
        description: 'Choose the memory provider to use',
        displayOptions: {
          show: {
            operation: ['executeGoal'],
            useN8nMemory: [true],
          },
        },
      },
      {
        displayName: 'Session Duration (hours)',
        name: 'sessionDuration',
        type: 'number',
        default: 24,
        description: 'How long to keep session data in memory',
        displayOptions: {
          show: {
            operation: ['executeGoal'],
            useN8nMemory: [true],
          },
        },
      },
      {
        displayName: 'Max History Items',
        name: 'maxHistoryItems',
        type: 'number',
        default: 100,
        description: 'Maximum number of history items to store',
        displayOptions: {
          show: {
            operation: ['executeGoal'],
            useN8nMemory: [true],
          },
        },
      },
    ];
  }
}
