import { Component } from '@angular/core';
import { OptionsBaseComponent } from '@components/panel-options/option-base-page.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';

@Component({
  selector: 'app-panel-options-debug',
  imports: [AnalyticsClickDirective],
  templateUrl: './panel-options-debug.component.html',
  styleUrl: './panel-options-debug.component.scss',
})
export class PanelOptionsDebugComponent extends OptionsBaseComponent {}
