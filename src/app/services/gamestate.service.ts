import { effect, inject, Injectable, signal } from '@angular/core';
import {
  canRunGameloop,
  gamestate,
  getOption,
  isCatchingUp,
  isGameStateReady,
  isPageVisible,
  migrateGameState,
  migrateOptionsState,
} from '@helpers';
import { ContentService } from '@services/content.service';
import { GameloopWorkerService } from '@services/gameloop-worker.service';
import { LoggerService } from '@services/logger.service';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GamestateService {
  private logger = inject(LoggerService);
  private contentService = inject(ContentService);
  private workerService = inject(GameloopWorkerService);

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
    this.doGameloop();
  }

  private doGameloop() {
    let lastRunTime = 0;

    const runLoop = (numTicks: number) => {
      lastRunTime = Date.now();

      this.workerService.runGameloop(numTicks);
    };

    runLoop(1);

    interval(1000).subscribe(() => {
      if (
        lastRunTime <= 0 ||
        !this.hasLoaded() ||
        !isGameStateReady() ||
        !canRunGameloop()
      )
        return;

      if (!isPageVisible() && !getOption('debugAllowBackgroundOperations')) {
        return;
      }

      const secondsElapsed = Math.round((Date.now() - lastRunTime) / 1000);

      // if we have a noticeable delay, drop the modal in to tell people a catchup is happening
      if (secondsElapsed > 30) {
        isCatchingUp.set(true);

        setTimeout(() => {
          runLoop(secondsElapsed);
        }, 0);

        return;
      }

      runLoop(secondsElapsed);

      isCatchingUp.set(false);
    });
  }
}
