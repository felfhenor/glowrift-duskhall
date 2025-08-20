import { DecimalPipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContextMenuStatsCompareComponent } from '@components/context-menu-stats-compare/context-menu-stats-compare.component';
import { GameMapPixiComponent } from '@components/game-map-pixi/game-map-pixi.component';
import { PanelCombatComponent } from '@components/panel-combat/panel-combat.component';
import { PanelContainerComponent } from '@components/panel-container/panel-container.component';
import { PanelHeroesComponent } from '@components/panel-heroes/panel-heroes.component';
import { PanelInventoryComponent } from '@components/panel-inventory/panel-inventory.component';
import { PanelLocationComponent } from '@components/panel-location/panel-location.component';
import { PanelOptionsComponent } from '@components/panel-options/panel-options.component';
import { PanelTownComponent } from '@components/panel-town/panel-town.component';

import { PanelWorldComponent } from '@components/panel-world/panel-world.component';
import {
  contextMenuStats,
  gamestate,
  isCatchingUp,
  showCombatMenu,
  showHeroesMenu,
  showInventoryMenu,
  showLocationMenu,
  showOptionsMenu,
  showTownMenu,
  showWorldMenu,
  victoryDismissWinDialog,
} from '@helpers';

@Component({
  selector: 'app-game-play',
  imports: [
    GameMapPixiComponent,
    PanelContainerComponent,
    PanelOptionsComponent,
    PanelHeroesComponent,
    PanelLocationComponent,
    PanelCombatComponent,
    PanelInventoryComponent,
    PanelTownComponent,
    DecimalPipe,
    RouterModule,
    PanelWorldComponent,
    ContextMenuStatsCompareComponent,
  ],
  templateUrl: './game-play.component.html',
  styleUrl: './game-play.component.scss',
})
export class GamePlayComponent {
  public showOptions = computed(() => showOptionsMenu());
  public showHeroes = computed(() => showHeroesMenu());
  public showCombat = computed(() => showCombatMenu());
  public showLocation = computed(() => showLocationMenu());
  public showInventory = computed(() => showInventoryMenu());
  public showTown = computed(() => showTownMenu());
  public showWorld = computed(() => showWorldMenu());

  public contextMenu = computed(() => contextMenuStats());

  public isCatchingUp = computed(() => isCatchingUp());
  public showWinNotification = computed(
    () =>
      gamestate().meta.hasWon && !gamestate().meta.hasDismissedWinNotification,
  );
  public winTicks = computed(() => gamestate().meta.wonAtTick);

  continuePlayingPostWin() {
    victoryDismissWinDialog();
  }
}
