import type { ApplicationConfig } from '@angular/core';
import {
  APP_INITIALIZER,
  ENVIRONMENT_INITIALIZER,
  ErrorHandler,
  importProvidersFrom,
  inject,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
  withRouterConfig,
} from '@angular/router';

import { provideHttpClient } from '@angular/common/http';

import { provideNgIconsConfig } from '@ng-icons/core';
import {
  popperVariation,
  provideTippyConfig,
  provideTippyLoader,
  tooltipVariation,
  withContextMenuVariation,
} from '@ngneat/helipopper/config';
import { routes } from '@routes/app.routes';
import { AnalyticsService } from '@services/analytics.service';
import { APIService } from '@services/api.service';
import { CameraService } from '@services/camera.service';
import { ContentService } from '@services/content.service';
import { GamestateService } from '@services/gamestate.service';
import { LoggerService, RollbarErrorHandler } from '@services/logger.service';
import { MetaService } from '@services/meta.service';
import { NotifyService } from '@services/notify.service';
import { SoundService } from '@services/sound.service';
import { ThemeService } from '@services/theme.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      withNavigationErrorHandler((error) => {
        // Handle the error, e.g., redirect to an error page
        console.error('Navigation error:', error);
        return '/';
      }),
    ),
    provideNgIconsConfig({
      size: '1.5em',
    }),
    importProvidersFrom(
      SweetAlert2Module.forRoot({
        provideSwal: () =>
          import('sweetalert2/dist/sweetalert2.js').then(({ default: swal }) =>
            swal.mixin({
              theme: 'dark',
              reverseButtons: true,
              showCancelButton: true,
              focusCancel: true,
            }),
          ),
      }),
    ),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
      autoDismiss: true,
      closeButton: true,
      maxOpened: 1,
    }),
    provideTippyLoader(() => import('tippy.js')),
    provideTippyConfig({
      defaultVariation: 'tooltip',
      variations: {
        tooltip: tooltipVariation,
        popper: popperVariation,
        contextMenu: {
          ...withContextMenuVariation(popperVariation),
          theme: 'translucent',
        },
      },
    }),
    {
      provide: ErrorHandler,
      useClass: RollbarErrorHandler,
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useValue: async () => {
        const meta = inject(MetaService);
        const logger = inject(LoggerService);
        const analytics = inject(AnalyticsService);

        await meta.init();
        logger.init();
        analytics.init();
      },
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(APIService).init(),
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(NotifyService).init(),
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: async () => await inject(ContentService).init(),
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(GamestateService).init(),
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(ThemeService).init(),
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(CameraService).init(),
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: async () => {
        await inject(SoundService).init();
      },
    },
  ],
};
