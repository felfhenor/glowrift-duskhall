import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import {
  blankGameState,
  gamestate,
  setGameState,
  totalTicksElapsed,
} from '@helpers';
import { ButtonSavefileExportComponent } from '@components/button-savefile-export/button-savefile-export.component';
import { ButtonSavefileImportComponent } from '@components/button-savefile-import/button-savefile-import.component';

@Component({
  selector: 'app-panel-options-savefile',
  imports: [
    SweetAlert2Module,
    DatePipe,
    DecimalPipe,
    ButtonSavefileExportComponent,
    ButtonSavefileImportComponent,
    AnalyticsClickDirective,
  ],
  templateUrl: './panel-options-savefile.component.html',
  styleUrl: './panel-options-savefile.component.css',
})
export class PanelOptionsSavefileComponent {
  private router = inject(Router);

  public startedAt = computed(() => gamestate().meta.createdAt);
  public numTicks = computed(() => totalTicksElapsed());

  async deleteSavefile() {
    await this.router.navigate(['/']);

    setGameState(blankGameState());
  }
}
