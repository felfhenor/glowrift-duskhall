import { Directive, HostListener, input } from '@angular/core';
import { playSFX } from '@helpers/sfx';
import type { SFX } from '@interfaces';

type SFXTrigger = 'click' | 'hover';

@Directive({
  selector: '[appSfx]',
})
export class SFXDirective {
  public appSfx = input.required<SFX>();
  public sfxOffset = input<number>(0);
  public sfxTrigger = input<SFXTrigger[]>(['click']);

  @HostListener('click')
  click() {
    if (!this.sfxTrigger().includes('click')) return;
    playSFX(this.appSfx(), 1 + this.sfxOffset());
  }

  @HostListener('mouseenter')
  mouseenter() {
    if (!this.sfxTrigger().includes('hover')) return;
    playSFX('ui-hover', 1 + this.sfxOffset());
  }
}
