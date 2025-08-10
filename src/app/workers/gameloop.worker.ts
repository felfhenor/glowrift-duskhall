import type { GameState } from '@interfaces';

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

// Simple gameloop implementation that operates directly on game state
// This avoids the complexity of importing all the helper dependencies
function doSimpleGameloop(
  gameState: GameState,
  totalTicks: number,
  debugTickMultiplier: number,
): { gameState: GameState; shouldWin: boolean } {
  // Create a working copy
  const state = structuredClone(gameState);
  const numTicks = totalTicks * debugTickMultiplier;

  // Simple tick increment - the main expensive operation we want to offload
  state.actionClock.numTicks += numTicks;

  // Check for win condition (simplified)
  const totalNodes = Object.keys(state.world.nodes).length;
  const claimedNodes = Object.values(state.world.claimedCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const hasWon =
    totalNodes > 0 && claimedNodes >= totalNodes && !state.meta.hasWon;

  if (hasWon) {
    state.meta.hasWon = true;
    state.meta.wonAtTick = state.actionClock.numTicks;
  }

  return { gameState: state, shouldWin: hasWon };
}

// Message handler
addEventListener('message', ({ data }: MessageEvent<WorkerMessage>) => {
  try {
    if (data.type === 'GAMELOOP_TICK') {
      const { gameState, totalTicks, options } = data.payload;

      if (options.gameloopPaused) {
        const response: WorkerResponse = {
          type: 'GAMELOOP_RESULT',
          payload: { gameState },
        };
        postMessage(response);
        return;
      }

      const result = doSimpleGameloop(
        gameState,
        totalTicks,
        options.debugTickMultiplier,
      );

      const response: WorkerResponse = {
        type: 'GAMELOOP_RESULT',
        payload: {
          gameState: result.gameState,
          shouldWin: result.shouldWin,
          shouldPause: result.shouldWin,
        },
      };

      postMessage(response);
    }
  } catch (error) {
    const errorResponse: WorkerResponse = {
      type: 'GAMELOOP_ERROR',
      payload: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    };

    postMessage(errorResponse);
  }
});
