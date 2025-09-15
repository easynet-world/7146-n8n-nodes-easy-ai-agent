import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

export function createLogger(name) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: name },
    transports: [
      new winston.transports.Console({
        format: consoleFormat
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: logFormat
      })
    ]
  });
}

export const logger = createLogger('AgentOrchestrator');
