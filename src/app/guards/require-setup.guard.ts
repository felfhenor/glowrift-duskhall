import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isSetup } from '@helpers';
import { LoggerService } from '@services/logger.service';

export const requireSetupGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (isSetup()) {
    return true;
  }

  const logger = inject(LoggerService);
  logger.info(
    'Guard:RequireSetup',
    'User tried to access',
    location.pathname,
    'without being setup',
  );

  router.navigate(['/home']);
  return false;
};
