import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        process.env.NODE_ENV === 'production'
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, stack }) => {
                return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ''}`;
              }),
            ),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(context ? `[${context}] ${message}` : message);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(context ? `[${context}] ${message}` : message, { stack: trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(context ? `[${context}] ${message}` : message);
  }

  debug(message: string, context?: string) {
    this.logger.debug(context ? `[${context}] ${message}` : message);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(context ? `[${context}] ${message}` : message);
  }
}
