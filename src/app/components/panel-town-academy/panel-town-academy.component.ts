import { Component, signal } from '@angular/core';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import { StatsSkillComponent } from '@components/stats-skill/stats-skill.component';
import type { EquipmentSkill } from '@interfaces/content-skill';
import { TeleportDirective } from '@ngneat/overview';

@Component({
  selector: 'app-panel-town-academy',
  imports: [
    CardPageComponent,
    InventoryGridContainerComponent,
    BlankSlateComponent,
    PanelTownBuildingUpgradeComponent,
    StatsSkillComponent,
    TeleportDirective,
  ],
  templateUrl: './panel-town-academy.component.html',
  styleUrl: './panel-town-academy.component.scss',
})
export class PanelTownAcademyComponent {
  public selectedSkill = signal<EquipmentSkill | undefined>(undefined);
}
