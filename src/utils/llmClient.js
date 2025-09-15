import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { createLogger } from './logger.js';

dotenv.config();
const logger = createLogger('LLMClient');

class LLMClient {
  constructor(provider, apiKey, model, baseUrl) {
    this.provider = provider || 'openrouter';
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
    
    if (this.provider === 'openrouter') {
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not set.');
      }
      if (!model) {
        throw new Error('OPENROUTER_MODEL is not set.');
      }
      this.baseUrl = baseUrl || 'https://openrouter.ai/api/v1';
    } else if (this.provider === 'ollama') {
      this.baseUrl = baseUrl || 'https://ollama-rtx-4070.easynet.world';
      this.model = model || 'llama3.1';
    }
    
    logger.info(`${this.provider} client initialized for model: ${this.model}`);
  }

  async chat(messages, options = {}) {
    if (this.provider === 'openrouter') {
      return await this._openRouterChat(messages, options);
    } else if (this.provider === 'ollama') {
      return await this._ollamaChat(messages, options);
    } else {
      throw new Error(`Unsupported LLM provider: ${this.provider}`);
    }
  }

  async _openRouterChat(messages, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/easynet-world/7146-easy-agent-orchestrator',
          'X-Title': 'AI Agent Orchestrator'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 4000,
          ...options
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenRouter API');
      }

      return {
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model,
        finish_reason: data.choices[0].finish_reason
      };

    } catch (error) {
      throw new Error(`OpenRouter API call failed: ${error.message}`);
    }
  }

  async _ollamaChat(messages, options = {}) {
    try {
      // Convert messages to Ollama format
      const prompt = this._convertMessagesToPrompt(messages);
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.max_tokens || 4000,
            ...options
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      
      return {
        content: data.response,
        usage: {
          prompt_tokens: data.prompt_eval_count || 0,
          completion_tokens: data.eval_count || 0,
          total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        },
        model: this.model,
        finish_reason: data.done ? 'stop' : 'length'
      };

    } catch (error) {
      throw new Error(`Ollama API call failed: ${error.message}`);
    }
  }

  _convertMessagesToPrompt(messages) {
    let prompt = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `System: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `Human: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    prompt += 'Assistant:';
    return prompt;
  }

  async generateResponse(systemPrompt, userMessage, options = {}) {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    messages.push({
      role: 'user',
      content: userMessage
    });

    return await this.chat(messages, options);
  }
}

export function createLLMClient() {
  const provider = process.env.LLM_PROVIDER || 'openrouter';
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.LLM_MODEL || process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3.1:free';
  const baseUrl = process.env.LLM_BASE_URL || process.env.OPENROUTER_BASE_URL;

  if (provider === 'openrouter') {
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is required for OpenRouter provider');
    }
    return new LLMClient('openrouter', apiKey, model, baseUrl);
  } else if (provider === 'ollama') {
    return new LLMClient('ollama', null, model, baseUrl);
  } else {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

// Backward compatibility
export function createOpenRouterClient() {
  return createLLMClient();
}
