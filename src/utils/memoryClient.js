import { createLogger } from './logger.js';

const logger = createLogger('MemoryClient');

class MemoryClient {
  constructor(redisUrl, redisPassword, redisDb) {
    this.redisUrl = redisUrl || 'redis://localhost:6379';
    this.redisPassword = redisPassword;
    this.redisDb = redisDb || 0;
    this.redis = null;
    this.connected = false;
  }

  async connect() {
    try {
      // Dynamic import for Redis client
      const { createClient } = await import('redis');
      
      this.redis = createClient({
        url: this.redisUrl,
        password: this.redisPassword,
        database: this.redisDb
      });

      this.redis.on('error', (err) => {
        logger.error(`Redis Client Error: ${err.message}`);
        this.connected = false;
      });

      this.redis.on('connect', () => {
        logger.info('Connected to Redis');
        this.connected = true;
      });

      this.redis.on('disconnect', () => {
        logger.warn('Disconnected from Redis');
        this.connected = false;
      });

      await this.redis.connect();
      return true;
    } catch (error) {
      logger.error(`Failed to connect to Redis: ${error.message}`);
      this.connected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.redis && this.connected) {
      await this.redis.disconnect();
      this.connected = false;
    }
  }

  async storeMemory(key, data, ttl = 3600) {
    if (!this.connected) {
      logger.warn('Redis not connected, memory not stored');
      return false;
    }

    try {
      const memoryData = {
        data: data,
        timestamp: new Date().toISOString(),
        ttl: ttl
      };

      await this.redis.setEx(key, ttl, JSON.stringify(memoryData));
      logger.info(`Memory stored with key: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to store memory: ${error.message}`);
      return false;
    }
  }

  async getMemory(key) {
    if (!this.connected) {
      logger.warn('Redis not connected, returning null');
      return null;
    }

    try {
      const memoryData = await this.redis.get(key);
      if (memoryData) {
        const parsed = JSON.parse(memoryData);
        logger.info(`Memory retrieved with key: ${key}`);
        return parsed.data;
      }
      return null;
    } catch (error) {
      logger.error(`Failed to get memory: ${error.message}`);
      return null;
    }
  }

  async deleteMemory(key) {
    if (!this.connected) {
      logger.warn('Redis not connected, memory not deleted');
      return false;
    }

    try {
      const result = await this.redis.del(key);
      logger.info(`Memory deleted with key: ${key}`);
      return result > 0;
    } catch (error) {
      logger.error(`Failed to delete memory: ${error.message}`);
      return false;
    }
  }

  async storeConversation(sessionId, conversation) {
    const key = `conversation:${sessionId}`;
    return await this.storeMemory(key, conversation, 86400); // 24 hours
  }

  async getConversation(sessionId) {
    const key = `conversation:${sessionId}`;
    return await this.getMemory(key);
  }

  async storeGoal(sessionId, goal, context, result) {
    const key = `goal:${sessionId}:${Date.now()}`;
    const goalData = {
      goal: goal,
      context: context,
      result: result,
      sessionId: sessionId
    };
    return await this.storeMemory(key, goalData, 604800); // 7 days
  }

  async getGoalHistory(sessionId, limit = 10) {
    if (!this.connected) {
      return [];
    }

    try {
      const pattern = `goal:${sessionId}:*`;
      const keys = await this.redis.keys(pattern);
      
      // Sort by timestamp (newest first)
      const sortedKeys = keys.sort((a, b) => {
        const timestampA = parseInt(a.split(':').pop());
        const timestampB = parseInt(b.split(':').pop());
        return timestampB - timestampA;
      });

      const goals = [];
      for (let i = 0; i < Math.min(limit, sortedKeys.length); i++) {
        const goalData = await this.getMemory(sortedKeys[i]);
        if (goalData) {
          goals.push(goalData);
        }
      }

      return goals;
    } catch (error) {
      logger.error(`Failed to get goal history: ${error.message}`);
      return [];
    }
  }

  async storeAgentState(agentId, state) {
    const key = `agent:${agentId}`;
    return await this.storeMemory(key, state, 1800); // 30 minutes
  }

  async getAgentState(agentId) {
    const key = `agent:${agentId}`;
    return await this.getMemory(key);
  }

  async storeTaskResult(sessionId, taskId, result) {
    const key = `task:${sessionId}:${taskId}`;
    return await this.storeMemory(key, result, 3600); // 1 hour
  }

  async getTaskResult(sessionId, taskId) {
    const key = `task:${sessionId}:${taskId}`;
    return await this.getMemory(key);
  }

  async clearSession(sessionId) {
    if (!this.connected) {
      return false;
    }

    try {
      const patterns = [
        `conversation:${sessionId}`,
        `goal:${sessionId}:*`,
        `task:${sessionId}:*`
      ];

      for (const pattern of patterns) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(keys);
        }
      }

      logger.info(`Session cleared: ${sessionId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to clear session: ${error.message}`);
      return false;
    }
  }

  async getStats() {
    if (!this.connected) {
      return null;
    }

    try {
      const info = await this.redis.info('memory');
      const dbSize = await this.redis.dbSize();
      
      return {
        connected: this.connected,
        dbSize: dbSize,
        memoryInfo: info
      };
    } catch (error) {
      logger.error(`Failed to get Redis stats: ${error.message}`);
      return null;
    }
  }
}

export function createMemoryClient() {
  const redisUrl = process.env.REDIS_URL;
  const redisPassword = process.env.REDIS_PASSWORD;
  const redisDb = parseInt(process.env.REDIS_DB) || 0;
  
  return new MemoryClient(redisUrl, redisPassword, redisDb);
}

export { MemoryClient };
