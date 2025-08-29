import { Component, computed } from '@angular/core';
import { ModalComponent } from '@components/modal/modal.component';
import { PanelOptionsComponent } from '@components/panel-options/panel-options.component';
import { SFXDirective } from '@directives/sfx.directive';
import { TeleportToDirective } from '@directives/teleport.to.directive';
import { showOptionsMenu } from '@helpers/ui';

@Component({
  selector: 'app-button-settings',
  imports: [
    SFXDirective,
    ModalComponent,
    PanelOptionsComponent,
    TeleportToDirective,
  ],
  templateUrl: './button-settings.component.html',
  styleUrl: './button-settings.component.scss',
})
export class ButtonSettingsComponent {
  public showSettings = computed(() => showOptionsMenu());

  public showOptions() {
    showOptionsMenu.set(true);
  }
}
