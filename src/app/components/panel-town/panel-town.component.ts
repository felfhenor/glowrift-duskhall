import { Component, computed, Signal } from '@angular/core';
import { TeleportOutletDirective } from '@ngneat/overview';
import { AnalyticsClickDirective } from '../../directives/analytics-click.directive';
import {
  getBuildingLevel,
  getOption,
  setOption,
  showTownMenu,
} from '../../helpers';
import { TownTab } from '../../interfaces';
import { CardPageComponent } from '../card-page/card-page.component';
import { IconComponent } from '../icon/icon.component';
import { PanelTownAcademyComponent } from '../panel-town-academy/panel-town-academy.component';
import { PanelTownAlchemistComponent } from '../panel-town-alchemist/panel-town-alchemist.component';
import { PanelTownBlacksmithComponent } from '../panel-town-blacksmith/panel-town-blacksmith.component';
import { PanelTownFestivalsComponent } from '../panel-town-festivals/panel-town-festivals.component';
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
    TeleportOutletDirective,
    PanelTownAlchemistComponent,
    PanelTownFestivalsComponent,
  ],
  templateUrl: './panel-town.component.html',
  styleUrl: './panel-town.component.scss',
})
export class PanelTownComponent {
  public activeTab = computed(() => getOption('townTab'));

  public changeActiveTab(building: TownTab) {
    setOption('townTab', building);
  }
  public readonly tabs: Array<{
    name: string;
    link: TownTab;
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
      showIf: computed(() => true),
      level: computed(() => getBuildingLevel('Blacksmith')),
    },
    {
      name: 'Alchemist',
      link: 'Alchemist',
      showIf: computed(() => true),
      level: computed(() => getBuildingLevel('Alchemist')),
    },
    {
      name: 'Academy',
      link: 'Academy',
      showIf: computed(() => false),
      level: computed(() => getBuildingLevel('Academy')),
    },
    {
      name: 'Festivals',
      link: 'Festivals',
      showIf: computed(() => true),
      level: computed(() => 0),
    },
  ];

  closeMenu() {
    showTownMenu.set(false);
  }
}
