import { effect, inject, Injectable, signal } from '@angular/core';
import { interval } from 'rxjs';
import {
  doGameloop,
  gamestate,
  getOption,
  isGameStateReady,
  migrateGameState,
  migrateOptionsState,
  spriteIterationCount,
} from '@helpers';
import { ContentService } from './content.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class GamestateService {
  private logger = inject(LoggerService);
  private contentService = inject(ContentService);

  public hasLoaded = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (!this.contentService.hasLoaded() || this.hasLoaded()) return;
      this.logger.info('GameState', 'Migrating gamestate...');

      migrateGameState();
      migrateOptionsState();

      this.logger.info('GameState', 'Gamestate migrated & loaded.');
      this.hasLoaded.set(true);
      isGameStateReady.set(true);
    });

    effect(() => {
      if (!this.hasLoaded()) return;

      const state = gamestate();

      if (getOption('debugConsoleLogStateUpdates')) {
        this.logger.debug('GameState Update', state);
      }
    });
  }

  init() {
    this.doSpriteloop();
    this.doGameloop();
  }

  private doSpriteloop() {
    interval(100).subscribe(() => {
      spriteIterationCount.set(spriteIterationCount() + 1);
    });
  }

  private doGameloop() {
    let lastRunTime = 0;

    function runLoop(numTicks: number) {
      lastRunTime = Date.now();
      doGameloop(numTicks);
    }

    runLoop(1);

    interval(1000).subscribe(() => {
      if (lastRunTime <= 0 || !this.hasLoaded() || !isGameStateReady()) return;

      const secondsElapsed = Math.round((Date.now() - lastRunTime) / 1000);
      runLoop(secondsElapsed);
    });
  }
}
