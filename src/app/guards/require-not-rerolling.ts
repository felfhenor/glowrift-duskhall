import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { ascendCurrentlyRerollingWorld } from '@helpers';
import { LoggerService } from '@services/logger.service';

export const requireNotRerolling: CanActivateFn = () => {
  const router = inject(Router);

  if (!ascendCurrentlyRerollingWorld()) {
    return true;
  }

  const logger = inject(LoggerService);
  logger.info(
    'Guard:RequireNotRerolling',
    'User tried to access',
    location.pathname,
    'while rerolling',
  );

  router.navigate(['/setup']);
  return false;
};
