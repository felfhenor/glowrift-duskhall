import { computed, Directive } from '@angular/core';
import { isInElectron } from '@helpers';
import { hostBinding } from 'ngxtension/host-binding';

@Directive({
  selector: '[appDisableOutsideElectron]',
})
export class DisableOutsideElectronDirective {
  public disabled = hostBinding(
    'class.disabled',
    computed(() => !isInElectron()),
  );

  public disabledAttr = hostBinding(
    'attr.disabled',
    computed(() => !isInElectron()),
  );
}
