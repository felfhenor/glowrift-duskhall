import { getEntriesByType, getEntry } from '@helpers/content';
import type { JobContent } from '@interfaces/content-job';
import type { Hero } from '@interfaces/hero';

export function jobUnlocked(): JobContent[] {
  return getEntriesByType<JobContent>('job');
}

export function jobMaxSkillsForHero(hero: Hero): number {
  return getEntry<JobContent>(hero.jobId)?.numSkills ?? 3;
}
