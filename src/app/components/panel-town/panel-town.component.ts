import { Component, computed, Signal } from '@angular/core';
import { AnalyticsClickDirective } from '../../directives/analytics-click.directive';
import {
  getBuildingLevel,
  getOption,
  localStorageSignal,
  setOption,
  showTownMenu,
} from '../../helpers';
import { TownBuilding } from '../../interfaces';
import { CardPageComponent } from '../card-page/card-page.component';
import { IconComponent } from '../icon/icon.component';
import { PanelTownAcademyComponent } from '../panel-town-academy/panel-town-academy.component';
import { PanelTownBlacksmithComponent } from '../panel-town-blacksmith/panel-town-blacksmith.component';
import { PanelTownMarketComponent } from '../panel-town-market/panel-town-market.component';
import { PanelTownMerchantComponent } from '../panel-town-merchant/panel-town-merchant.component';

@Component({
  selector: 'app-panel-town',
  imports: [
    CardPageComponent,
    IconComponent,
    AnalyticsClickDirective,
    PanelTownMarketComponent,
    PanelTownBlacksmithComponent,
    PanelTownMerchantComponent,
    PanelTownAcademyComponent,
  ],
  templateUrl: './panel-town.component.html',
  styleUrl: './panel-town.component.scss',
})
export class PanelTownComponent {
  // public activeTab = localStorageSignal<TownBuilding>('townTab', 'Market');
  public activeTab = computed(() => getOption('townTab'));

  public changeActiveTab(building: TownBuilding) {
    setOption('townTab', building);
  }
  public readonly tabs: Array<{
    name: string;
    link: TownBuilding;
    showIf: Signal<boolean>;
    level: Signal<number>;
  }> = [
    {
      name: 'Market',
      link: 'Market',
      showIf: computed(() => true),
      level: computed(() => getBuildingLevel('Market')),
    },
    {
      name: 'Merchant',
      link: 'Merchant',
      showIf: computed(() => true),
      level: computed(() => getBuildingLevel('Merchant')),
    },
    {
      name: 'Blacksmith',
      link: 'Blacksmith',
      showIf: computed(() => false),
      level: computed(() => getBuildingLevel('Blacksmith')),
    },
    {
      name: 'Academy',
      link: 'Academy',
      showIf: computed(() => false),
      level: computed(() => getBuildingLevel('Academy')),
    },
  ];

  closeMenu() {
    showTownMenu.set(false);
  }
}
