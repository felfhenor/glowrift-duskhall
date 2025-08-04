import { DecimalPipe } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GameMapPixiComponent } from '@components/game-map-pixi/game-map-pixi.component';
import { PanelCombatComponent } from '@components/panel-combat/panel-combat.component';
import { PanelHeroesComponent } from '@components/panel-heroes/panel-heroes.component';
import { PanelInventoryComponent } from '@components/panel-inventory/panel-inventory.component';
import { PanelLocationComponent } from '@components/panel-location/panel-location.component';
import { PanelOptionsComponent } from '@components/panel-options/panel-options.component';
import { PanelTownComponent } from '@components/panel-town/panel-town.component';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HotkeysService } from '@ngneat/hotkeys';

import {
  closeAllMenus,
  dismissWinGameDialog,
  focusCameraOnPlayer,
  gamestate,
  getOption,
  isCatchingUp,
  setOption,
  showCombatMenu,
  showHeroesMenu,
  showInventoryMenu,
  showLocationMenu,
  showOptionsMenu,
  showTownMenu,
} from '@helpers';

@Component({
  selector: 'app-game-play',
  imports: [
    GameMapPixiComponent,
    PanelOptionsComponent,
    PanelHeroesComponent,
    PanelLocationComponent,
    PanelCombatComponent,
    PanelInventoryComponent,
    PanelTownComponent,
    DecimalPipe,
    RouterModule,
  ],
  templateUrl: './game-play.component.html',
  styleUrl: './game-play.component.scss',
})
export class GamePlayComponent implements OnInit {
  public showOptions = computed(() => showOptionsMenu());
  public showHeroes = computed(() => showHeroesMenu());
  public showCombat = computed(() => showCombatMenu());
  public showLocation = computed(() => showLocationMenu());
  public showInventory = computed(() => showInventoryMenu());
  public showTown = computed(() => showTownMenu());
  private isGameloopPaused = computed(() => getOption('gameloopPaused'));
  public isCatchingUp = computed(() => isCatchingUp());
  public showWinNotification = computed(
    () =>
      gamestate().meta.hasWon && !gamestate().meta.hasDismissedWinNotification,
  );
  public winTicks = computed(() => gamestate().meta.wonAtTick);

  continuePlayingPostWin() {
    dismissWinGameDialog();
  }

  constructor(private hotkeys: HotkeysService) {}

  ngOnInit() {
    //Space to pause and resume
    this.hotkeys
      .addShortcut({ keys: 'space' })
      .subscribe(() => setOption('gameloopPaused', !this.isGameloopPaused()));

    //Escape to close open menu
    this.hotkeys
      .addShortcut({ keys: 'escape' })
      .subscribe(() => closeAllMenus());

    //1 to show Town menu
    this.hotkeys.addShortcut({ keys: '1' }).subscribe(() => {
      if (showTownMenu()) {
        showTownMenu.set(false);
        return;
      }

      closeAllMenus();
      showTownMenu.set(!showTownMenu());
    });

    //2 to show Combat menu
    this.hotkeys.addShortcut({ keys: '2' }).subscribe(() => {
      if (showCombatMenu()) {
        showCombatMenu.set(false);
        return;
      }

      closeAllMenus();
      showCombatMenu.set(!showCombatMenu());
    });

    //3 to show Inventory menu
    this.hotkeys.addShortcut({ keys: '3' }).subscribe(() => {
      if (showInventoryMenu()) {
        showInventoryMenu.set(false);
        return;
      }
      closeAllMenus();
      showInventoryMenu.set(!showInventoryMenu());
    });

    //4 to show Hero menu
    this.hotkeys.addShortcut({ keys: '4' }).subscribe(() => {
      if (showHeroesMenu()) {
        showHeroesMenu.set(false);
        return;
      }

      closeAllMenus();
      showHeroesMenu.set(!showHeroesMenu());
    });
    //5 to show player location
    this.hotkeys.addShortcut({ keys: '5' }).subscribe(() => {
      focusCameraOnPlayer();
    });
    //6 to show Options
    this.hotkeys.addShortcut({ keys: '6' }).subscribe(() => {
      if (showOptionsMenu()) {
        showOptionsMenu.set(false);
        return;
      }

      closeAllMenus();
      showOptionsMenu.set(!showOptionsMenu());
    });
  }
}
