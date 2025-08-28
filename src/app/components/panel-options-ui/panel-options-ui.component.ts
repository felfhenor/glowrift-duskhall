import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OptionsBaseComponent } from '@components/panel-options/option-base-page.component';
import type {
  GlanceClaimView,
  GlanceHeroView,
  GlanceResourceView,
  ToggleableCategory,
} from '@interfaces';

@Component({
  selector: 'app-panel-options-ui',
  imports: [FormsModule, TitleCasePipe, DecimalPipe],
  templateUrl: './panel-options-ui.component.html',
  styleUrl: './panel-options-ui.component.scss',
})
export class PanelOptionsUIComponent extends OptionsBaseComponent {
  public currentTheme = signal<string>(this.getOption('uiTheme') as string);

  public glanceResourceView = signal<GlanceResourceView>(
    this.getOption('glanceResourceView') as GlanceResourceView,
  );

  public glanceClaimView = signal<GlanceClaimView>(
    this.getOption('glanceClaimView') as GlanceClaimView,
  );

  public glanceHeroView = signal<GlanceHeroView>(
    this.getOption('glanceHeroView') as GlanceHeroView,
  );

  public notificationsEnabled = computed(() =>
    this.getOption('canSendNotifications'),
  );

  public notificationCategoriesEnabled = computed(
    () =>
      this.getOption('enabledNotificationCategories') as ToggleableCategory[],
  );

  public readonly themes = [
    { name: 'acid', type: 'light' },
    { name: 'autumn', type: 'light' },
    {
      name: 'black',
      type: 'dark',
    },
    { name: 'bumblebee', type: 'light' },
    {
      name: 'business',
      type: 'dark',
    },
    {
      name: 'coffee',
      type: 'dark',
    },
    { name: 'cmyk', type: 'light' },
    { name: 'corporate', type: 'light' },
    { name: 'cupcake', type: 'light' },
    { name: 'cyberpunk', type: 'light' },
    {
      name: 'dark',
      type: 'dark',
    },
    {
      name: 'dim',
      type: 'dark',
    },
    {
      name: 'dracula',
      type: 'dark',
    },
    { name: 'emerald', type: 'light' },
    { name: 'fantasy', type: 'light' },
    {
      name: 'forest',
      type: 'dark',
    },
    { name: 'garden', type: 'light' },
    {
      name: 'halloween',
      type: 'dark',
    },
    { name: 'lemonade', type: 'light' },
    { name: 'light', type: 'light' },
    { name: 'lofi', type: 'light' },
    {
      name: 'luxury',
      type: 'dark',
    },
    {
      name: 'night',
      type: 'dark',
    },
    { name: 'nord', type: 'light' },
    { name: 'pastel', type: 'light' },
    { name: 'retro', type: 'light' },
    {
      name: 'sunset',
      type: 'dark',
    },
    { name: 'synthwave', type: 'dark' },
    { name: 'valentine', type: 'light' },
    { name: 'winter', type: 'light' },
    { name: 'wireframe', type: 'light' },
  ].filter((t) => t.type !== 'light');

  public toggleNotifications() {
    this.setOption(
      'canSendNotifications',
      !this.getOption('canSendNotifications'),
    );
  }

  public toggleNotificationCategories(category: ToggleableCategory) {
    if (this.notificationCategoriesEnabled().includes(category)) {
      const newEnabledCategories = this.notificationCategoriesEnabled().filter(
        (cat: ToggleableCategory) => cat !== category,
      );
      this.setOption('enabledNotificationCategories', newEnabledCategories);

      return;
    }

    this.setOption('enabledNotificationCategories', [
      ...this.notificationCategoriesEnabled(),
      category,
    ]);
  }
}
