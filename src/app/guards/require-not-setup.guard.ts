import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isSetup } from '@helpers';
import { LoggerService } from '@services/logger.service';

export const requireNotSetupGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (!isSetup()) {
    return true;
  }

  const logger = inject(LoggerService);
  logger.info(
    'Guard:RequireNotSetup',
    'User tried to access',
    location.pathname,
    'while being setup',
  );

  router.navigate(['/home']);
  return false;
};
