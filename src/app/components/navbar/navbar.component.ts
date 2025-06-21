import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TippyDirective } from '@ngneat/helipopper';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { RequireSetupDirective } from '../../directives/require-setup.directive';
import { SFXDirective } from '../../directives/sfx.directive';
import {
  ALL_ICONS,
  closeAllMenus,
  focusCameraOnPlayer,
  gamestate,
  getOption,
  globalStatusText,
  isGameloopPaused,
  setOption,
  showCombatMenu,
  showCurrencyList,
  showHeroesMenu,
  showInventoryMenu,
  showOptionsMenu,
  showTownMenu,
} from '../../helpers';
import { GameCurrency } from '../../interfaces';
import { MetaService } from '../../services/meta.service';
import { IconComponent } from '../icon/icon.component';
import { MarkerCurrencyCurrentComponent } from '../marker-currency-current/marker-currency-current.component';

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
export class NavbarComponent {
  public meta = inject(MetaService);
  public router = inject(Router);

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
    icon: keyof typeof ALL_ICONS;
    clickCb: () => void;
  }> = [
    {
      name: 'Town',
      icon: 'gameMedievalGate',
      clickCb: () => this.toggleTown(),
    },
    {
      name: 'Combat',
      icon: 'gameSwordBrandish',
      clickCb: () => this.toggleCombat(),
    },
    {
      name: 'Inventory',
      icon: 'gameSwapBag',
      clickCb: () => this.toggleInventory(),
    },
    { name: 'Heroes', icon: 'gameAges', clickCb: () => this.toggleHeroes() },
    {
      name: 'Focus Camera',
      icon: 'gameHumanTarget',
      clickCb: () => this.focusCamera(),
    },
    {
      name: 'Options',
      icon: 'tablerSettings',
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

  public focusCamera() {
    focusCameraOnPlayer();
  }

  public togglePause() {
    setOption('gameloopPaused', !this.isPaused())
  }
}
