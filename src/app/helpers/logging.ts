/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDate } from '@angular/common';
import { color } from 'console-log-colors';

// Store original console functions with proper binding
const nativeConsole = {
  log: Function.prototype.bind.call(console.log, console),
  info: Function.prototype.bind.call(console.info, console),
  warn: Function.prototype.bind.call(console.warn, console),
  debug: Function.prototype.bind.call(console.debug, console),
  error: Function.prototype.bind.call(console.error, console),
};

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
  const colorFunc = color[colors[level]] as unknown as (str: string) => string;

  const timestamp = formatDate(new Date(), 'medium', 'en-US');
  // Use native console method to bypass the call stack issue
  nativeConsole[level](colorFunc(`[${timestamp}] {${category}}`), ...data);
}

export function log(category: string, ...data: any) {
  const colors = { log: 'magenta' as keyof typeof color };
  const colorFunc = color[colors.log] as unknown as (str: string) => string;
  const timestamp = formatDate(new Date(), 'medium', 'en-US');
  nativeConsole.log(colorFunc(`[${timestamp}] {${category}}`), ...data);
}

export function info(category: string, ...data: any) {
  const colors = { info: 'blue' as keyof typeof color };
  const colorFunc = color[colors.info] as unknown as (str: string) => string;
  const timestamp = formatDate(new Date(), 'medium', 'en-US');
  nativeConsole.info(colorFunc(`[${timestamp}] {${category}}`), ...data);
}

export function warn(category: string, ...data: any) {
  const colors = { warn: 'yellow' as keyof typeof color };
  const colorFunc = color[colors.warn] as unknown as (str: string) => string;
  const timestamp = formatDate(new Date(), 'medium', 'en-US');
  nativeConsole.warn(colorFunc(`[${timestamp}] {${category}}`), ...data);
}

export function debug(category: string, ...data: any) {
  const colors = { debug: 'gray' as keyof typeof color };
  const colorFunc = color[colors.debug] as unknown as (str: string) => string;
  const timestamp = formatDate(new Date(), 'medium', 'en-US');
  nativeConsole.debug(colorFunc(`[${timestamp}] {${category}}`), ...data);
}

export function error(category: string, ...data: any) {
  const colors = { error: 'red' as keyof typeof color };
  const colorFunc = color[colors.error] as unknown as (str: string) => string;
  const timestamp = formatDate(new Date(), 'medium', 'en-US');
  nativeConsole.error(colorFunc(`[${timestamp}] {${category}}`), ...data);
}
