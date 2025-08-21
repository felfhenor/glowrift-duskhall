import { Component, computed } from '@angular/core';
import { ButtonCloseComponent } from '@components/button-close/button-close.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { ConnectButtonsComponent } from '@components/connect-buttons/connect-buttons.component';
import { PanelOptionsDebugComponent } from '@components/panel-options-debug/panel-options-debug.component';
import { PanelOptionsSavefileComponent } from '@components/panel-options-savefile/panel-options-savefile.component';
import { PanelOptionsUIComponent } from '@components/panel-options-ui/panel-options-ui.component';
import { OptionsBaseComponent } from '@components/panel-options/option-base-page.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { options, showOptionsMenu } from '@helpers';
import type { OptionsTab, OptionsTabLink } from '@interfaces';

@Component({
  selector: 'app-panel-options',
  imports: [
    CardPageComponent,
    ConnectButtonsComponent,
    AnalyticsClickDirective,
    PanelOptionsDebugComponent,
    PanelOptionsSavefileComponent,
    PanelOptionsUIComponent,
    ButtonCloseComponent,
  ],
  templateUrl: './panel-options.component.html',
  styleUrl: './panel-options.component.scss',
})
export class PanelOptionsComponent extends OptionsBaseComponent {
  public activeTab = computed(() => options()['optionsTab']);

  public changeActiveTab(tab: OptionsTab): void {
    this.setOption('optionsTab', tab);
  }

  public readonly tabs: OptionsTabLink[] = [
    {
      name: 'UI',
      link: 'UI',
      showIf: computed(() => true),
    },
    { name: 'Savefile', link: 'Savefile', showIf: computed(() => true) },
    {
      name: 'Debug',
      link: 'Debug',
      showIf: computed(() => options().showDebug),
    },
  ];

  closeMenu() {
    showOptionsMenu.set(false);
  }
}
