import { Component } from '@angular/core';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import { TeleportDirective } from '@ngneat/overview';

@Component({
  selector: 'app-panel-town-blacksmith',
  imports: [
    PanelTownBuildingUpgradeComponent,
    CardPageComponent,
    TeleportDirective,
  ],
  templateUrl: './panel-town-blacksmith.component.html',
  styleUrl: './panel-town-blacksmith.component.scss',
})
export class PanelTownBlacksmithComponent {}
