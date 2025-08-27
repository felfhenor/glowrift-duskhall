import { Component, computed, linkedSignal } from '@angular/core';
import { ButtonCloseComponent } from '@components/button-close/button-close.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { getEntriesByType } from '@helpers/content';
import { showHelpMenu } from '@helpers/ui';
import type { HelpContent } from '@interfaces/content-help';
import { sortBy, uniqBy } from 'es-toolkit/compat';

@Component({
  selector: 'app-panel-help',
  imports: [CardPageComponent, ButtonCloseComponent],
  templateUrl: './panel-help.component.html',
  styleUrl: './panel-help.component.scss',
})
export class PanelHelpComponent {
  public allHelps = computed(() => getEntriesByType<HelpContent>('help'));
  public allCategories = computed(() =>
    uniqBy(this.allHelps(), (h) => h.category)
      .map((h) => h.category)
      .sort(),
  );

  public currentCategory = linkedSignal<string>(() => this.allCategories()[0]);
  public currentHelps = computed(() =>
    sortBy(
      this.allHelps().filter((h) => h.category === this.currentCategory()),
      (h) => h.name,
    ),
  );

  closeMenu() {
    showHelpMenu.set(false);
  }

  public changeCategory(newCategory: string) {
    this.currentCategory.set(newCategory);
  }
}
