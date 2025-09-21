import { getEntry } from '@helpers/content';
import type { TraitLocationContent } from '@interfaces/content-trait-location';
import type { WorldLocation } from '@interfaces/world';

export function locationTraits(
  location: WorldLocation,
): TraitLocationContent[] {
  return (location.traitIds ?? [])
    .map((t) => getEntry<TraitLocationContent>(t)!)
    .filter(Boolean);
}
