// query.logger.ts
import { Logger as TypeORMLogger } from 'typeorm';
import { Logger as NestLogger } from '@nestjs/common';

/**
 * Custom QueryLogger for TypeORM queries, errors, and events.
 * Stores logs in memory and can be extended for persistent logging.
 */
export class QueryLogger implements TypeORMLogger {
  /**
   * Array to store all log entries for the current logger instance.
   */
  public readonly logs: any[] = [];

  /**
   * NestJS logger instance for outputting SQL logs to the Nest logger system.
   */
  private readonly nestLogger = new NestLogger('SQL');

  /**
   * Shared static reference to the current QueryLogger instance.
   * Used to ensure logs are associated with the correct request context.
   */
  static current?: QueryLogger; // 👈 Shared static reference

  /**
   * Creates a new QueryLogger instance.
   * @param requestId Optional request identifier for associating logs with a request.
   */
  constructor(public readonly requestId?: string) {}

  /**
   * Adds a log entry to the logs array, handling deduplication for query errors.
   * @param type The type of log (e.g., 'query', 'query-error', etc.)
   * @param data The log data to store.
   * @returns The log entry object.
   */
  private addLog(type: string, data: Record<string, any>) {
    if (type === 'query-error') {
      const { query, parameters } = data;
      const index = this.logs.findIndex(
        (log) =>
          log.type === 'query' &&
          log.query === query &&
          JSON.stringify(log.parameters) === JSON.stringify(parameters),
      );
      if (index !== -1) {
        this.logs.splice(index, 1);
      }
    }

    const log = {
      requestId: this.requestId,
      type,
      ...data,
      timestamp: new Date().toISOString(),
    };

    //   this.nestLogger.log(JSON.stringify(log));
    this.logs.push(log);
    return log;
  }

  /**
   * Logs a successful SQL query.
   * @param query The SQL query string.
   * @param parameters Optional query parameters.
   */
  logQuery(query: string, parameters?: any[]) {
    return QueryLogger.current?.addLog('query', { query, parameters });
  }

  /**
   * Logs a query error event.
   * @param error The error message.
   * @param query The SQL query string.
   * @param parameters Optional query parameters.
   */
  logQueryError(error: string, query: string, parameters?: any[]) {
    return QueryLogger.current?.addLog('query-error', {
      query,
      parameters,
      error,
    });
  }

  /**
   * Logs a slow query event.
   * @param time The execution time in milliseconds.
   * @param query The SQL query string.
   * @param parameters Optional query parameters.
   */
  logQuerySlow(time: number, query: string, parameters?: any[]) {
    return QueryLogger.current?.addLog('query-slow', {
      query,
      parameters,
      time,
    });
  }

  /**
   * Logs a schema build event (e.g., migrations, schema sync).
   * @param message The schema build message.
   */
  logSchemaBuild(message: string) {
    return QueryLogger.current?.addLog('schema', { message });
  }

  /**
   * Logs a migration event.
   * @param message The migration message.
   */
  logMigration(message: string) {
    return QueryLogger.current?.addLog('migration', { message });
  }

  /**
   * Generic log method for custom log levels.
   * @param level The log level ('log', 'info', or 'warn').
   * @param message The log message.
   */
  log(level: 'log' | 'info' | 'warn', message: any) {
    return QueryLogger.current?.addLog(level, { message });
  }
}
