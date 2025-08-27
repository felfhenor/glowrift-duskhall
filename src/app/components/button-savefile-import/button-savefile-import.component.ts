import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { SFXDirective } from '@directives/sfx.directive';
import {
  closeAllMenus,
  migrateGameState,
  notifySuccess,
  setGameState,
} from '@helpers';
import type { GameState } from '@interfaces';

@Component({
  selector: 'app-button-savefile-import',
  imports: [AnalyticsClickDirective, SFXDirective],
  templateUrl: './button-savefile-import.component.html',
  styleUrl: './button-savefile-import.component.scss',
})
export class ButtonSavefileImportComponent {
  private router = inject(Router);

  importSavefile(e: Event) {
    const fileInput = e.target as HTMLInputElement;
    if (!e || !e.target || !fileInput.files) {
      return;
    }

    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = (ev) => {
      const charFile = JSON.parse(
        (ev.target as FileReader).result as string,
      ) as GameState;

      const finish = () => {
        fileInput.value = '';
      };

      setGameState(charFile);
      migrateGameState();
      closeAllMenus();

      finish();

      notifySuccess(`Successfully imported savefile!`);

      this.router.navigate(['/game']);
    };

    reader.readAsText(file);
  }
}
