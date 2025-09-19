import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { ascendCurrentlyRerollingWorld, isSetup } from '@helpers';
import { LoggerService } from '@services/logger.service';

export const setupPageGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (ascendCurrentlyRerollingWorld()) return true;

  if (!isSetup()) return true;

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
