import type { OnDestroy, OnInit } from '@angular/core';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonHelpComponent } from '@components/button-help/button-help.component';
import { ButtonQuitComponent } from '@components/button-quit/button-quit.component';
import { ButtonSettingsComponent } from '@components/button-settings/button-settings.component';
import { ButtonUpdateComponent } from '@components/button-update/button-update.component';
import { IconComponent } from '@components/icon/icon.component';
import { ModalComponent } from '@components/modal/modal.component';
import { RequireNotSetupDirective } from '@directives/no-setup.directive';
import { RequireSetupDirective } from '@directives/require-setup.directive';
import { SFXDirective } from '@directives/sfx.directive';
import {
  cameraCenterOnPlayer,
  closeAllMenus,
  getOption,
  globalStatusText,
  isShowingAnyMenu,
  setOption,
  showCombatMenu,
  showCurrencyList,
  showHelpMenu,
  showHeroesMenu,
  showInventoryMenu,
  showOptionsMenu,
  showTownMenu,
  showWorldMenu,
} from '@helpers';
import type { Icon } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';
import { HotkeysDirective, HotkeysService } from '@ngneat/hotkeys';
import { MetaService } from '@services/meta.service';
import type { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-navbar',
  imports: [
    TippyDirective,
    RequireSetupDirective,
    IconComponent,
    SweetAlert2Module,
    SFXDirective,
    ButtonUpdateComponent,
    HotkeysDirective,
    RequireNotSetupDirective,
    ModalComponent,
    ButtonQuitComponent,
    ButtonSettingsComponent,
    ButtonHelpComponent,
  ],
  providers: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private hotkeys = inject(HotkeysService);

  public meta = inject(MetaService);
  public router = inject(Router);

  public showPauseMenu = signal<boolean>(false);
  private wasPausedBeforeOpeningMenu = signal<boolean>(false);

  public leaveSwal = viewChild<SwalComponent>('leaveSwal');

  public isPaused = computed(() => getOption('gameloopPaused'));
  public currentStatus = computed(() => globalStatusText());

  public readonly panelConfigs: Array<{
    name: string;
    icon: Icon;
    hotkey: string;
    clickCb: () => void;
  }> = [
    {
      name: 'World',
      icon: 'gameWorld',
      hotkey: '1',
      clickCb: () => this.toggleWorld(),
    },
    {
      name: 'Town',
      icon: 'gameMedievalGate',
      hotkey: '2',
      clickCb: () => this.toggleTown(),
    },
    {
      name: 'Combat',
      icon: 'gameSwordBrandish',
      hotkey: '3',
      clickCb: () => this.toggleCombat(),
    },
    {
      name: 'Inventory',
      icon: 'gameSwapBag',
      hotkey: '4',
      clickCb: () => this.toggleInventory(),
    },
    {
      name: 'Heroes',
      icon: 'gameAges',
      hotkey: '5',
      clickCb: () => this.toggleHeroes(),
    },
  ];

  ngOnInit() {
    this.hotkeys
      .addShortcut({ keys: 'escape' })
      .subscribe(() => this.closeAllMenus());
  }

  ngOnDestroy() {
    this.hotkeys.removeShortcuts(['escape']);
  }

  public toggleCurrencyList() {
    showCurrencyList.set(!showCurrencyList());
  }

  public toggleOptions() {
    if (showOptionsMenu()) {
      showOptionsMenu.set(false);
      return;
    }

    closeAllMenus();
    showOptionsMenu.set(!showOptionsMenu());
  }

  public toggleHeroes() {
    if (showHeroesMenu()) {
      showHeroesMenu.set(false);
      return;
    }

    closeAllMenus();
    showHeroesMenu.set(!showHeroesMenu());
  }

  public toggleCombat() {
    if (showCombatMenu()) {
      showCombatMenu.set(false);
      return;
    }

    closeAllMenus();
    showCombatMenu.set(!showCombatMenu());
  }

  public toggleInventory() {
    if (showInventoryMenu()) {
      showInventoryMenu.set(false);
      return;
    }

    closeAllMenus();
    showInventoryMenu.set(!showInventoryMenu());
  }

  public toggleTown() {
    if (showTownMenu()) {
      showTownMenu.set(false);
      return;
    }

    closeAllMenus();
    showTownMenu.set(!showTownMenu());
  }

  public toggleWorld() {
    if (showWorldMenu()) {
      showWorldMenu.set(false);
      return;
    }

    closeAllMenus();
    showWorldMenu.set(!showWorldMenu());
  }

  public focusCamera() {
    cameraCenterOnPlayer();
  }

  public togglePause() {
    if (this.showPauseMenu()) return;
    setOption('gameloopPaused', !this.isPaused());
  }

  public goToHome() {
    closeAllMenus();
    this.router.navigate(['..']);
  }

  public closePauseMenu() {
    this.showPauseMenu.set(false);
    if (!this.wasPausedBeforeOpeningMenu()) {
      this.togglePause();
    }
  }

  public openPauseMenu() {
    this.showPauseMenu.set(true);
    if (this.isPaused()) {
      this.wasPausedBeforeOpeningMenu.set(true);
    } else {
      this.wasPausedBeforeOpeningMenu.set(false);
      this.togglePause();
    }
  }

  private closeAllMenus() {
    if (showHelpMenu()) {
      showHelpMenu.set(false);
      return;
    }

    if (showOptionsMenu()) {
      showOptionsMenu.set(false);
      return;
    }

    if (this.showPauseMenu()) {
      this.closePauseMenu();
      return;
    }

    if (!isShowingAnyMenu()) {
      this.openPauseMenu();
      return;
    }

    closeAllMenus(true);
  }
}
