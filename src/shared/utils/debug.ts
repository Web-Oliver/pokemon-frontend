/**
 * Debug Utilities - Single Responsibility: Centralized logging and debugging
 * DRY: Eliminates duplicate logging code across components
 * SOLID: Open/Closed - easily extensible for new debug types
 */

export enum DebugLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface DebugContext {
  component?: string;
  operation?: string;
  requestId?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export class DebugLogger {
  private static instance: DebugLogger;
  private level: DebugLevel = DebugLevel.DEBUG;
  private prefix: string = '🔍';

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  private constructor() {
    // Set debug level based on environment
    if (import.meta.env.DEV) {
      this.level = DebugLevel.TRACE;
    }
  }

  setLevel(level: DebugLevel): void {
    this.level = level;
  }

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  error(message: string, context?: DebugContext, data?: any): void {
    if (this.level >= DebugLevel.ERROR) {
      this.log('❌ ERROR', message, context, data, console.error);
    }
  }

  warn(message: string, context?: DebugContext, data?: any): void {
    if (this.level >= DebugLevel.WARN) {
      this.log('⚠️ WARN', message, context, data, console.warn);
    }
  }

  info(message: string, context?: DebugContext, data?: any): void {
    if (this.level >= DebugLevel.INFO) {
      this.log('ℹ️ INFO', message, context, data, console.info);
    }
  }

  debug(message: string, context?: DebugContext, data?: any): void {
    if (this.level >= DebugLevel.DEBUG) {
      this.log('🔍 DEBUG', message, context, data, console.log);
    }
  }

  trace(message: string, context?: DebugContext, data?: any): void {
    if (this.level >= DebugLevel.TRACE) {
      this.log('🔬 TRACE', message, context, data, console.log);
    }
  }

  private log(
    level: string, 
    message: string, 
    context?: DebugContext, 
    data?: any,
    logFn: (message?: any, ...optionalParams: any[]) => void = console.log
  ): void {
    const timestamp = new Date().toISOString();
    const contextStr = this.formatContext(context);
    const fullMessage = `[${timestamp}] ${level} ${this.prefix}${contextStr} ${message}`;
    
    if (data) {
      logFn(fullMessage, data);
    } else {
      logFn(fullMessage);
    }
  }

  private formatContext(context?: DebugContext): string {
    if (!context) return '';
    
    const parts: string[] = [];
    if (context.component) parts.push(`[${context.component}]`);
    if (context.operation) parts.push(`[${context.operation}]`);
    if (context.requestId) parts.push(`[${context.requestId}]`);
    
    return parts.length > 0 ? ` ${parts.join('')}` : '';
  }
}

// Specialized debuggers for different domains
export class ApiDebugger {
  private logger = DebugLogger.getInstance();
  private static readonly CONTEXT_PREFIX = 'API';

  logRequest(method: string, url: string, data?: any, headers?: Record<string, string>): void {
    this.logger.debug(`${method} ${url}`, {
      component: ApiDebugger.CONTEXT_PREFIX,
      operation: 'REQUEST'
    }, {
      method,
      url,
      hasData: !!data,
      dataType: data instanceof FormData ? 'FormData' : typeof data,
      headers: headers ? Object.keys(headers) : []
    });

    if (data instanceof FormData) {
      const files = Array.from(data.entries()).map(([key, value]) => ({
        key,
        isFile: value instanceof File,
        fileName: value instanceof File ? value.name : 'not-file',
        size: value instanceof File ? value.size : 0
      }));
      this.logger.trace('FormData contents', {
        component: ApiDebugger.CONTEXT_PREFIX,
        operation: 'REQUEST_FORMDATA'
      }, files);
    }
  }

  logResponse(status: number, ok: boolean, headers?: Headers, responseTime?: number): void {
    this.logger.debug(`Response ${status}`, {
      component: ApiDebugger.CONTEXT_PREFIX,
      operation: 'RESPONSE'
    }, {
      status,
      ok,
      responseTime: responseTime ? `${responseTime}ms` : 'unknown',
      headers: headers ? Object.fromEntries(headers.entries()) : {}
    });
  }

  logError(error: Error, context?: { method?: string; url?: string; attempt?: number }): void {
    this.logger.error('Request failed', {
      component: ApiDebugger.CONTEXT_PREFIX,
      operation: 'ERROR'
    }, {
      error: error.message,
      name: error.name,
      stack: error.stack,
      context
    });
  }

  logRetry(attempt: number, maxRetries: number, delay: number): void {
    this.logger.warn(`Retrying request (${attempt}/${maxRetries})`, {
      component: ApiDebugger.CONTEXT_PREFIX,
      operation: 'RETRY'
    }, { attempt, maxRetries, delay });
  }
}

export class ComponentDebugger {
  private logger = DebugLogger.getInstance();
  
  constructor(private componentName: string) {}

  logMount(): void {
    this.logger.info(`Component mounted`, {
      component: this.componentName,
      operation: 'MOUNT'
    });
  }

  logUnmount(): void {
    this.logger.info(`Component unmounted`, {
      component: this.componentName,
      operation: 'UNMOUNT'
    });
  }

  logStateChange(stateName: string, oldValue: any, newValue: any): void {
    this.logger.debug(`State change: ${stateName}`, {
      component: this.componentName,
      operation: 'STATE_CHANGE'
    }, { stateName, oldValue, newValue });
  }

  logAction(actionName: string, payload?: any): void {
    this.logger.debug(`Action: ${actionName}`, {
      component: this.componentName,
      operation: 'ACTION'
    }, payload);
  }

  logError(error: Error, context?: string): void {
    this.logger.error(`Component error${context ? ` in ${context}` : ''}`, {
      component: this.componentName,
      operation: 'ERROR'
    }, {
      error: error.message,
      stack: error.stack,
      context
    });
  }
}

// Global debug instances
export const apiDebugger = new ApiDebugger();
export const createComponentDebugger = (name: string) => new ComponentDebugger(name);

// Utility functions
export const debugUpload = (files: File[], component: string = 'UPLOAD'): void => {
  const logger = createComponentDebugger(component);
  logger.logAction('FILE_SELECTION', {
    fileCount: files.length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    types: [...new Set(files.map(f => f.type))],
    files: files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    }))
  });
};

export const debugDuplicateDetection = (results: any, component: string = 'ICR'): void => {
  const logger = createComponentDebugger(component);
  logger.logAction('DUPLICATE_DETECTION', {
    successful: results.successful,
    failed: results.failed,
    duplicateCount: results.duplicateCount,
    duplicates: results.duplicates?.map((dup: any) => ({
      index: dup.index,
      existingId: dup.existingId,
      message: dup.message
    }))
  });
};