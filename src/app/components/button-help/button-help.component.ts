import { Component, computed } from '@angular/core';
import { ModalComponent } from '@components/modal/modal.component';
import { PanelHelpComponent } from '@components/panel-help/panel-help.component';
import { SFXDirective } from '@directives/sfx.directive';
import { TeleportToDirective } from '@directives/teleport.to.directive';
import { showHelpMenu } from '@helpers/ui';

@Component({
  selector: 'app-button-help',
  imports: [
    PanelHelpComponent,
    ModalComponent,
    TeleportToDirective,
    SFXDirective,
  ],
  templateUrl: './button-help.component.html',
  styleUrl: './button-help.component.scss',
})
export class ButtonHelpComponent {
  public showingHelp = computed(() => showHelpMenu());

  public showHelp() {
    showHelpMenu.set(true);
  }
}
