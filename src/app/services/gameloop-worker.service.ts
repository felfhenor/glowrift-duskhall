import { inject, Injectable } from '@angular/core';
import {
  doGameloop,
  gamestate,
  getOption,
  setGameState,
  setOption,
  winGame,
} from '@helpers';
import type { GameState } from '@interfaces';
import { LoggerService } from '@services/logger.service';

interface WorkerMessage {
  type: 'GAMELOOP_TICK';
  payload: {
    gameState: GameState;
    totalTicks: number;
    options: {
      debugTickMultiplier: number;
      gameloopPaused: boolean;
    };
  };
}

interface WorkerResponse {
  type: 'GAMELOOP_RESULT' | 'GAMELOOP_ERROR';
  payload: {
    gameState?: GameState;
    shouldPause?: boolean;
    shouldWin?: boolean;
    error?: string;
    stack?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class GameloopWorkerService {
  private logger = inject(LoggerService);
  private worker: Worker | null = null;
  private isProcessing = false;
  private pendingTicks = 0;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    try {
      this.worker = new Worker(
        new URL('../workers/gameloop.worker.ts', import.meta.url),
        { type: 'module' },
      );

      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        console.log(event.data.payload.gameState?.actionClock?.numTicks);
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        this.logger.error('GameloopWorker', 'Worker error:', error);
        this.isProcessing = false;
      };

      this.logger.info('GameloopWorker', 'Worker initialized successfully');
    } catch (error) {
      this.logger.error(
        'GameloopWorker',
        'Failed to initialize worker:',
        error,
      );
      this.worker = null;
    }
  }

  private handleWorkerMessage(data: WorkerResponse): void {
    this.isProcessing = false;

    if (data.type === 'GAMELOOP_ERROR') {
      this.logger.error(
        'GameloopWorker',
        'Gameloop error:',
        data.payload.error,
      );
      if (data.payload.stack) {
        this.logger.error('GameloopWorker', 'Stack trace:', data.payload.stack);
      }
      return;
    }

    if (data.type === 'GAMELOOP_RESULT') {
      const { gameState, shouldPause, shouldWin } = data.payload;

      // Handle win condition
      if (shouldWin) {
        winGame();
      }

      if (shouldPause) {
        setOption('gameloopPaused', true);
      }

      if (!gameState) {
        return;
      }

      setGameState(gameState);

      if (this.pendingTicks > 0) {
        const ticksToProcess = this.pendingTicks;
        this.pendingTicks = 0;
        this.runGameloop(ticksToProcess);
      }
    }
  }

  public runGameloop(totalTicks: number): void {
    // If worker is not available, fall back to synchronous processing
    if (!this.worker) {
      this.logger.warn(
        'GameloopWorker',
        'Worker not available, falling back to main thread',
      );
      doGameloop(totalTicks);
      return;
    }

    // If already processing, accumulate ticks
    if (this.isProcessing) {
      this.pendingTicks += totalTicks;
      return;
    }

    this.isProcessing = true;

    const currentGameState = gamestate();
    const message: WorkerMessage = {
      type: 'GAMELOOP_TICK',
      payload: {
        gameState: currentGameState,
        totalTicks,
        options: {
          debugTickMultiplier: getOption('debugTickMultiplier'),
          gameloopPaused: getOption('gameloopPaused'),
        },
      },
    };

    this.worker.postMessage(message);
  }

  public destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isProcessing = false;
    this.pendingTicks = 0;
  }
}
