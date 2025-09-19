import { currencyGain } from '@helpers/currency';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { globalStatusText } from '@helpers/ui';
import type { AscensionCopyData } from '@interfaces/ascension';
import type { LocationType } from '@interfaces/content-worldconfig';
import { meanBy } from 'es-toolkit/compat';

export function ascendCurrentlyRerollingWorld(): boolean {
  return gamestate().meta.isCurrentlyAscending;
}

export function ascendCurrencyObtained(): number {
  const worldPercent = ascendCurrentPercentage();
  const worldSizeMultiplier = gamestate().world.config.duskmoteMultiplier ?? 1;

  if (worldPercent < 25) return 0;

  let tokens = worldPercent;
  if (worldPercent >= 50) tokens += 50;
  if (worldPercent >= 75) tokens += 75;
  if (worldPercent >= 90) tokens += 150;
  if (worldPercent >= 100) tokens += 300;

  return Math.floor(tokens * worldSizeMultiplier);
}

export function ascendCurrentPercentage(): number {
  return gamestate().duskmote.currentWorldCapturePercentage;
}

export function ascendCalculateCurrentPercentage(): number {
  const { nodeCounts, claimedCounts } = gamestate().world;

  return meanBy(
    Object.keys(nodeCounts),
    (key) =>
      (claimedCounts[key as LocationType] / nodeCounts[key as LocationType]) *
      100,
  );
}

export function ascendUpdateHighestCompletionPercentage(): void {
  const currentPercent = ascendCalculateCurrentPercentage();

  updateGamestate((state) => {
    state.duskmote.currentWorldCapturePercentage = Math.max(
      state.duskmote.currentWorldCapturePercentage,
      currentPercent,
    );
    return state;
  });
}

export function ascendCanDo(): boolean {
  return ascendCurrentPercentage() >= 25;
}

export function ascendDo(): void {
  globalStatusText.set('');

  currencyGain('Duskmote', ascendCurrencyObtained());

  updateGamestate((state) => {
    state.meta.isSetup = false;
    state.duskmote.numAscends += 1;
    state.meta.isCurrentlyAscending = true;

    return state;
  });
}

export function ascendCopyData(): AscensionCopyData {
  const state = gamestate();

  return {
    numAscends: state.duskmote.numAscends,
    totalDuskmotes: state.currency.currencies.Duskmote,
    bundles: state.duskmote.unlockedBundles,
  };
}

export function ascendSetCopiedData(data: AscensionCopyData): void {
  updateGamestate((state) => {
    state.duskmote.numAscends = data.numAscends;
    state.currency.currencies.Duskmote = data.totalDuskmotes;
    state.duskmote.unlockedBundles = data.bundles;

    return state;
  });
}
