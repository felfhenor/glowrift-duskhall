import type { Signal } from '@angular/core';
import { Component, computed } from '@angular/core';
import { ButtonCloseComponent } from '@components/button-close/button-close.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { PanelTownAcademyComponent } from '@components/panel-town-academy/panel-town-academy.component';
import { PanelTownAlchemistComponent } from '@components/panel-town-alchemist/panel-town-alchemist.component';
import { PanelTownBlacksmithComponent } from '@components/panel-town-blacksmith/panel-town-blacksmith.component';
import { PanelTownFestivalsComponent } from '@components/panel-town-festivals/panel-town-festivals.component';
import { PanelTownMarketComponent } from '@components/panel-town-market/panel-town-market.component';
import { PanelTownMerchantComponent } from '@components/panel-town-merchant/panel-town-merchant.component';
import { PanelTownSalvagerComponent } from '@components/panel-town-salvager/panel-town-salvager.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { getBuildingLevel, getOption, setOption, showTownMenu } from '@helpers';
import type { TownTab } from '@interfaces';
import { TeleportOutletDirective } from '@ngneat/overview';

@Component({
  selector: 'app-panel-town',
  imports: [
    CardPageComponent,
    ButtonCloseComponent,
    AnalyticsClickDirective,
    PanelTownMarketComponent,
    PanelTownBlacksmithComponent,
    PanelTownMerchantComponent,
    PanelTownAcademyComponent,
    TeleportOutletDirective,
    PanelTownAlchemistComponent,
    PanelTownFestivalsComponent,
    PanelTownSalvagerComponent,
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
      name: 'Salvager',
      link: 'Salvager',
      showIf: computed(() => true),
      level: computed(() => getBuildingLevel('Salvager')),
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
      showIf: computed(() => true),
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
