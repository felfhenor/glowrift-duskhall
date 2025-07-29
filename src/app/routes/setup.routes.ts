import type { Routes } from '@angular/router';
import { GameGenerateWorldComponent } from '@pages/game-generate-world/game-generate-world.component';
import { GameSetupWorldComponent } from '@pages/game-setup-world/game-setup-world.component';

export const setupRoutes: Routes = [
  {
    component: GameSetupWorldComponent,
    path: 'world',
  },
  {
    component: GameGenerateWorldComponent,
    path: 'generate',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'world',
  },
];
