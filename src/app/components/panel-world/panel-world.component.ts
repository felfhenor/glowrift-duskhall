import { Component, computed } from '@angular/core';
import { ButtonCloseComponent } from '@components/button-close/button-close.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { PanelWorldClaimlogComponent } from '@components/panel-world-claimlog/panel-world-claimlog.component';
import { PanelWorldClaimsComponent } from '@components/panel-world-claims/panel-world-claims.component';
import { PanelWorldDuskmotesComponent } from '@components/panel-world-duskmotes/panel-world-duskmotes.component';
import { PanelWorldEmpireManagementComponent } from '@components/panel-world-empire-management/panel-world-empire-management.component';
import { PanelWorldFestivalsComponent } from '@components/panel-world-festivals/panel-world-festivals.component';
import { PanelWorldResourceGenerationComponent } from '@components/panel-world-resource-generation/panel-world-resource-generation.component';
import { PanelWorldRiftglowComponent } from '@components/panel-world-riftglow/panel-world-riftglow.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { getOption, setOption } from '@helpers/state-options';
import { showWorldMenu } from '@helpers/ui';
import type { WorldTab } from '@interfaces/state-options';

@Component({
  selector: 'app-panel-world',
  imports: [
    AnalyticsClickDirective,
    ButtonCloseComponent,
    CardPageComponent,
    PanelWorldClaimsComponent,
    PanelWorldFestivalsComponent,
    PanelWorldResourceGenerationComponent,
    PanelWorldClaimlogComponent,
    PanelWorldEmpireManagementComponent,
    PanelWorldRiftglowComponent,
    PanelWorldDuskmotesComponent,
  ],
  templateUrl: './panel-world.component.html',
  styleUrl: './panel-world.component.scss',
})
export class PanelWorldComponent {
  public activeTab = computed(() => getOption('worldTab'));

  public changeActiveTab(building: WorldTab) {
    setOption('worldTab', building);
  }
  public readonly tabs: Array<{
    name: string;
    link: WorldTab;
  }> = [
    { name: 'Resource Generation', link: 'ResourceGeneration' },
    {
      name: 'Riftglow Allocation',
      link: 'Riftglow',
    },
    { name: 'Empire Management', link: 'EmpireManagement' },
    { name: 'Claimed Locations', link: 'Claims' },
    { name: 'Claim Log', link: 'ClaimsLog' },
    {
      name: 'Festivals',
      link: 'Festivals',
    },
    {
      name: 'Duskmotes',
      link: 'Duskmotes',
    },
  ];

  closeMenu() {
    showWorldMenu.set(false);
  }
}
