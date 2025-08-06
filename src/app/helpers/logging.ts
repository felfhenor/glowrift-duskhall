/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDate } from '@angular/common';
import { color } from 'console-log-colors';

/**
 * Logging utilities with colored output, timestamps, and caller location information.
 * 
 * This logging system captures the actual caller location using Error.stack and
 * includes it in the log output, making debugging easier without relying on
 * browser console stack traces.
 */

/**
 * Extracts caller information from Error.stack
 * @param stackFramesToSkip Number of stack frames to skip (default: 3 to skip this function and two wrapper levels)
 * @returns Caller location string or 'unknown' if not found
 */
function getCallerInfo(stackFramesToSkip: number = 3): string {
  try {
    const error = new Error();
    const stack = error.stack;
    if (!stack) return 'unknown';
    
    const stackLines = stack.split('\n');
    // Skip the first line (Error message) and the specified number of frames
    const callerLine = stackLines[stackFramesToSkip + 1];
    
    if (!callerLine) return 'unknown';
    
    // Extract file and line info from stack trace
    // Format varies by browser, but typically: "at function (file:line:column)"
    const match = callerLine.match(/\s+at\s+(?:.*\s+)?\(?([^)]+)\)?/);
    if (match && match[1]) {
      // Clean up the path to show just filename and line
      const fullPath = match[1];
      const pathParts = fullPath.split('/');
      const filename = pathParts[pathParts.length - 1];
      return filename;
    }
    
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Core logging function that includes caller information
 */
function logWithCaller(level: 'log' | 'info' | 'warn' | 'debug' | 'error', colorName: keyof typeof color, category: string, ...data: any) {
  const colorFunc = color[colorName] as unknown as (str: string) => string;
  const timestamp = formatDate(new Date(), 'medium', 'en-US');
  const caller = getCallerInfo();
  
  // Include caller information in the log prefix
  const formattedPrefix = colorFunc(`[${timestamp}] {${category}} (${caller})`);
  
  // Use the console method directly
  switch (level) {
    case 'log':
      console.log(formattedPrefix, ...data);
      break;
    case 'info':
      console.info(formattedPrefix, ...data);
      break;
    case 'warn':
      console.warn(formattedPrefix, ...data);
      break;
    case 'debug':
      console.debug(formattedPrefix, ...data);
      break;
    case 'error':
      console.error(formattedPrefix, ...data);
      break;
  }
}

export function _logMessage(
  level: 'debug' | 'error' | 'log' | 'info' | 'warn',
  category: string,
  ...data: any
) {
  const colors: Record<typeof level, keyof typeof color> = {
    debug: 'gray',
    error: 'red',
    log: 'magenta',
    warn: 'yellow',
    info: 'blue',
  };
  logWithCaller(level, colors[level], category, ...data);
}

export function log(category: string, ...data: any) {
  logWithCaller('log', 'magenta', category, ...data);
}

export function info(category: string, ...data: any) {
  logWithCaller('info', 'blue', category, ...data);
}

export function warn(category: string, ...data: any) {
  logWithCaller('warn', 'yellow', category, ...data);
}

export function debug(category: string, ...data: any) {
  logWithCaller('debug', 'gray', category, ...data);
}

export function error(category: string, ...data: any) {
  logWithCaller('error', 'red', category, ...data);
}

/**
 * Enhanced logging function that includes a stack trace for detailed debugging.
 * Use this when you need to see the complete call stack.
 */
export function trace(category: string, ...data: any) {
  const timestamp = formatDate(new Date(), 'medium', 'en-US');
  const caller = getCallerInfo(2); // Skip fewer frames for trace
  const colorFunc = color.cyan as unknown as (str: string) => string;
  const formattedPrefix = colorFunc(`[${timestamp}] {${category}} (${caller}) [TRACE]`);
  
  console.log(formattedPrefix, ...data);
  console.trace('Call stack:');
}
