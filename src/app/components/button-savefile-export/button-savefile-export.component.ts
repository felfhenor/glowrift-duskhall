import { Component } from '@angular/core';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { gamestate } from '@helpers';

@Component({
  selector: 'app-button-savefile-export',
  imports: [AnalyticsClickDirective],
  templateUrl: './button-savefile-export.component.html',
  styleUrl: './button-savefile-export.component.css',
})
export class ButtonSavefileExportComponent {
  exportSavefile() {
    const state = gamestate();

    const fileName = `${Date.now()}.grdh`;
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', fileName);
    downloadAnchorNode.click();
  }
}
