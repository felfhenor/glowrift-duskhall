import type { OnDestroy, OnInit } from '@angular/core';
import { Component, computed, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '@components/icon/icon.component';
import { MarkerCurrencyCurrentComponent } from '@components/marker-currency-current/marker-currency-current.component';
import { RequireSetupDirective } from '@directives/require-setup.directive';
import { SFXDirective } from '@directives/sfx.directive';
import {
  cameraCenterOnPlayer,
  closeAllMenus,
  gamestate,
  getOption,
  globalStatusText,
  setOption,
  showCombatMenu,
  showCurrencyList,
  showHeroesMenu,
  showInventoryMenu,
  showOptionsMenu,
  showTownMenu,
  showWorldMenu,
} from '@helpers';
import type { GameCurrency, Icon } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';
import { HotkeysService } from '@ngneat/hotkeys';
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
    MarkerCurrencyCurrentComponent,
  ],
  providers: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private hotkeys = inject(HotkeysService);

  public meta = inject(MetaService);
  public router = inject(Router);

  public leaveSwal = viewChild<SwalComponent>('leaveSwal');

  public isPaused = computed(() => getOption('gameloopPaused'));
  public currentStatus = computed(() => globalStatusText());

  public shouldShowCurrencyList = computed(() => showCurrencyList());

  public displayedCurrencies = computed(() => {
    const currentCurrencies = gamestate().currency.currencies;
    return Object.keys(currentCurrencies).filter(
      (c) =>
        c !== 'Mana' && Math.floor(currentCurrencies[c as GameCurrency]) > 0,
    ) as GameCurrency[];
  });

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
    {
      name: 'Options',
      icon: 'tablerSettings',
      hotkey: '6',
      clickCb: () => this.toggleOptions(),
    },
  ];

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
    setOption('gameloopPaused', !this.isPaused());
  }

  ngOnInit() {
    // Menu toggles
    this.hotkeys.addShortcut({ keys: '1' }).subscribe(() => this.toggleWorld());
    this.hotkeys.addShortcut({ keys: '2' }).subscribe(() => this.toggleTown());
    this.hotkeys
      .addShortcut({ keys: '3' })
      .subscribe(() => this.toggleCombat());
    this.hotkeys
      .addShortcut({ keys: '4' })
      .subscribe(() => this.toggleInventory());
    this.hotkeys
      .addShortcut({ keys: '5' })
      .subscribe(() => this.toggleHeroes());
    this.hotkeys
      .addShortcut({ keys: '6' })
      .subscribe(() => this.toggleOptions());

    // Game controls
    this.hotkeys.addShortcut({ keys: 'f' }).subscribe(() => this.focusCamera());
    this.hotkeys
      .addShortcut({ keys: 'space' })
      .subscribe(() => this.togglePause());
    this.hotkeys
      .addShortcut({ keys: 'escape' })
      .subscribe(() => closeAllMenus());

    // Navigation
    this.hotkeys.addShortcut({ keys: 'q' }).subscribe(() => {
      this.leaveSwal()?.fire();
    });
  }

  ngOnDestroy() {
    this.hotkeys.removeShortcuts([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      'f',
      'space',
      'escape',
      'q',
    ]);
  }
}
