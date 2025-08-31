/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ErrorHandler } from '@angular/core';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import {
  debug,
  error,
  info,
  localVersion,
  log,
  versionInfoToSemver,
  warn,
} from '@helpers';
import Rollbar from 'rollbar';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private rollbar!: Rollbar;

  private readonly ignoredMessageSubstrings: string[] = [
    'Failed to fetch dynamically imported module',
    'is not valid JSON',
    'Script error',
    'jQuery',
    'The object is in an invalid state.',
    '$0',
    'NG0950',
    'hotToastComponentList',
  ];

  private lastId = signal<string>('');

  constructor() {}

  init() {
    if (environment.rollbar.accessToken) {
      const rollbarConfig = structuredClone(environment.rollbar);

      const realVersion = localVersion();
      if (realVersion) {
        rollbarConfig.payload.client.javascript.code_version =
          versionInfoToSemver(realVersion) ?? 'UNKNOWN';
      }

      this.rollbar = new Rollbar({
        ...rollbarConfig,
        checkIgnore: (uncaught, args) => {
          const argMessage = args[0]?.toString() ?? '';
          return this.ignoredMessageSubstrings.some((msg) =>
            argMessage.includes(msg),
          );
        },
      });
    }
  }

  public log(category: string, ...data: any) {
    log(category, ...data);
  }

  public info(category: string, ...data: any) {
    info(category, ...data);
  }

  public warn(category: string, ...data: any) {
    warn(category, ...data);
  }

  public debug(category: string, ...data: any) {
    debug(category, ...data);
  }

  public error(category: string, ...data: any) {
    error(category, ...data);
  }

  public rollbarError(error: any) {
    this.rollbar?.error(error.originalError || error);
  }

  public setUserInformation(id: string, username: string): void {
    if (id === this.lastId()) return;

    this.rollbar?.configure({
      payload: {
        person: {
          id,
          username,
        },
      },
    });

    this.lastId.set(id);
  }
}

@Injectable()
export class RollbarErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);

  handleError(error: any) {
    this.logger.error('Error', error);
    this.logger.rollbarError(error);
  }
}
