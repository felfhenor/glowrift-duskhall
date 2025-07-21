import type { Routes } from '@angular/router';
import { GamePlayComponent } from '@pages/game-play/game-play.component';

export const gameRoutes: Routes = [
  {
    component: GamePlayComponent,
    path: '',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];
