import { computed, Directive } from '@angular/core';
import { ascendCurrentlyRerollingWorld, isSetup } from '@helpers';
import { hostBinding } from 'ngxtension/host-binding';

@Directive({
  selector: '[appRequireSetup]',
})
export class RequireSetupDirective {
  public hidden = hostBinding(
    'class.hidden',
    computed(() => !isSetup() || ascendCurrentlyRerollingWorld()),
  );
}
