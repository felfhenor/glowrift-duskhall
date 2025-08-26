import type { SFX } from '@interfaces';
import { Subject } from 'rxjs';

const sfx = new Subject<{
  sfx: SFX;
  rate: number;
}>();
export const sfx$ = sfx.asObservable();

export function playSFX(sfxName: SFX, shiftIndex: number): void {
  sfx.next({ sfx: sfxName, rate: shiftIndex * 25 });
}
