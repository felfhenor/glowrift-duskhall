/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDate } from '@angular/common';
import { color } from 'console-log-colors';

// Create helper function that applies formatting and calls console directly
function callConsole(level: 'log' | 'info' | 'warn' | 'debug' | 'error', colorName: keyof typeof color, category: string, ...data: any) {
  const colorFunc = color[colorName] as unknown as (str: string) => string;
  const timestamp = formatDate(new Date(), 'medium', 'en-US');
  const formattedPrefix = colorFunc(`[${timestamp}] {${category}}`);
  
  // Use the console method directly to minimize call stack interference
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
  callConsole(level, colors[level], category, ...data);
}

export function log(category: string, ...data: any) {
  callConsole('log', 'magenta', category, ...data);
}

export function info(category: string, ...data: any) {
  callConsole('info', 'blue', category, ...data);
}

export function warn(category: string, ...data: any) {
  callConsole('warn', 'yellow', category, ...data);
}

export function debug(category: string, ...data: any) {
  callConsole('debug', 'gray', category, ...data);
}

export function error(category: string, ...data: any) {
  callConsole('error', 'red', category, ...data);
}
