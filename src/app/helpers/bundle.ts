import { currencyHasAmount, currencyLose } from '@helpers/currency';
import { gamestate, updateGamestate } from '@helpers/state-game';
import type {
  DuskmoteBundleContent,
  DuskmoteBundleId,
} from '@interfaces/content-duskmotebundle';

export function bundleIsUnlocked(key: DuskmoteBundleId): boolean {
  if (!key) return true;

  return gamestate().duskmote.unlockedBundles[key];
}

export function bundleUnlock(bundle: DuskmoteBundleContent): void {
  if (!bundleCanUnlock(bundle)) return;

  currencyLose('Duskmote', bundle.cost);

  updateGamestate((state) => {
    state.duskmote.unlockedBundles[bundle.id] = true;
    return state;
  });
}

export function bundleCanUnlock(bundle: DuskmoteBundleContent): boolean {
  return (
    currencyHasAmount('Duskmote', bundle.cost) && !bundleIsUnlocked(bundle.id)
  );
}
