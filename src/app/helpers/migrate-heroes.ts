import { getEntry } from '@helpers/content';
import { updateGamestate } from '@helpers/state-game';
import type { JobContent } from '@interfaces/content-job';

export function migrateHeroes() {
  updateGamestate((state) => {
    state.hero.heroes.forEach((hero) => {
      const entry = getEntry<JobContent>(hero.jobId);
      if (!entry) {
        hero.jobId = getEntry<JobContent>('Diviner')!.id;
      }
    });

    return state;
  });
}
