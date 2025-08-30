import { DecimalPipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GameMapPixiComponent } from '@components/game-map-pixi/game-map-pixi.component';
import { PanelCombatComponent } from '@components/panel-combat/panel-combat.component';
import { PanelContainerComponent } from '@components/panel-container/panel-container.component';
import { PanelHeroesComponent } from '@components/panel-heroes/panel-heroes.component';
import { PanelInventoryComponent } from '@components/panel-inventory/panel-inventory.component';
import { PanelLocationComponent } from '@components/panel-location/panel-location.component';
import { PanelTownComponent } from '@components/panel-town/panel-town.component';

import { GlanceClaimsComponent } from '@components/glance-claims/glance-claims.component';
import { GlanceFailuresComponent } from '@components/glance-failures/glance-failures.component';
import { GlanceHeroesComponent } from '@components/glance-heroes/glance-heroes.component';
import { GlanceResourcesComponent } from '@components/glance-resources/glance-resources.component';
import { ModalComponent } from '@components/modal/modal.component';
import { OptionsBaseComponent } from '@components/panel-options/option-base-page.component';
import { PanelWorldComponent } from '@components/panel-world/panel-world.component';
import { VignettePauseComponent } from '@components/vignette-pause/vignette-pause.component';
import { TeleportOutletDirective } from '@directives/teleport.outlet.directive';
import {
  closeAllMenus,
  gamestate,
  getOption,
  isCatchingUp,
  isShowingAnyMenu,
  showCombatMenu,
  showHeroesMenu,
  showInventoryMenu,
  showLocationMenu,
  showTownMenu,
  showWorldMenu,
  victoryDismissWinDialog,
} from '@helpers';

@Component({
  selector: 'app-game-play',
  imports: [
    GameMapPixiComponent,
    PanelContainerComponent,
    PanelHeroesComponent,
    PanelLocationComponent,
    PanelCombatComponent,
    PanelInventoryComponent,
    PanelTownComponent,
    DecimalPipe,
    RouterModule,
    PanelWorldComponent,
    GlanceResourcesComponent,
    GlanceHeroesComponent,
    GlanceClaimsComponent,
    GlanceFailuresComponent,
    ModalComponent,
    TeleportOutletDirective,
    VignettePauseComponent,
  ],
  templateUrl: './game-play.component.html',
  styleUrl: './game-play.component.scss',
})
export class GamePlayComponent extends OptionsBaseComponent {
  public showHeroes = computed(() => showHeroesMenu());
  public showCombat = computed(() => showCombatMenu());
  public showLocation = computed(() => showLocationMenu());
  public showInventory = computed(() => showInventoryMenu());
  public showTown = computed(() => showTownMenu());
  public showWorld = computed(() => showWorldMenu());
  public showGlanceResources = computed(() => getOption('glanceResourceView'));
  public showGlanceHeroes = computed(() => getOption('glanceHeroView'));
  public showGlanceClaims = computed(() => getOption('glanceClaimView'));
  public showGlanceFailures = computed(
    () =>
      getOption('showHeroFailureIndicator') &&
      gamestate().hero.failuresSinceLastSuccess > 0,
  );
  public isPaused = computed(() => getOption('gameloopPaused'));

  public isShowingAnyMenu = computed(() => isShowingAnyMenu());

  public isCatchingUp = computed(() => isCatchingUp());
  public showWinNotification = computed(
    () =>
      gamestate().meta.hasWon && !gamestate().meta.hasDismissedWinNotification,
  );
  public winTicks = computed(() => gamestate().meta.wonAtTick);

  closeAllMenus() {
    closeAllMenus();
  }

  continuePlayingPostWin() {
    victoryDismissWinDialog();
  }
}
