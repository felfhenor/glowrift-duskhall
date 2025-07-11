import { Component } from '@angular/core';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { OptionsBaseComponent } from '@components/panel-options/option-base-page.component';

@Component({
  selector: 'app-panel-options-debug',
  imports: [AnalyticsClickDirective],
  templateUrl: './panel-options-debug.component.html',
  styleUrl: './panel-options-debug.component.css',
})
export class PanelOptionsDebugComponent extends OptionsBaseComponent {}
