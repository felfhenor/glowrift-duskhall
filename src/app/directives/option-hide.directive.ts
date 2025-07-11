import { computed, Directive, input } from '@angular/core';
import { hostBinding } from 'ngxtension/host-binding';
import { getOption } from '@helpers';
import { GameOption } from '@interfaces';

@Directive({
  selector: '[appShowIfOption]',
})
export class ShowIfOptionDirective {
  public appShowIfOption = input.required<GameOption>();

  public hidden = hostBinding(
    'class.hidden',
    computed(() => !getOption(this.appShowIfOption())),
  );
}
