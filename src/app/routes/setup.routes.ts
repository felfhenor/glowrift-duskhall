import type { Routes } from '@angular/router';
import { GameSetupWorldComponent } from '@pages/game-setup-world/game-setup-world.component';

export const setupRoutes: Routes = [
  {
    component: GameSetupWorldComponent,
    path: 'world',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'world',
  },
];
