import { computed, Directive } from '@angular/core';
import { hostBinding } from 'ngxtension/host-binding';
import { isSetup } from '@helpers';

@Directive({
  selector: '[appRequireSetup]',
})
export class RequireSetupDirective {
  public hidden = hostBinding(
    'class.hidden',
    computed(() => !isSetup()),
  );
}
