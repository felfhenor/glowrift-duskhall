import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '@components/icon/icon.component';
import {
  ascendCanDo,
  ascendCurrencyObtained,
  ascendCurrentPercentage,
  ascendDo,
} from '@helpers/ascension';
import { currencyGet } from '@helpers/currency';
import { showDuskmoteShop } from '@helpers/ui';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-panel-world-duskmotes',
  imports: [IconComponent, DecimalPipe, SweetAlert2Module],
  templateUrl: './panel-world-duskmotes.component.html',
  styleUrl: './panel-world-duskmotes.component.scss',
})
export class PanelWorldDuskmotesComponent {
  private router = inject(Router);

  public canAscend = computed(() => ascendCanDo());
  public currentDuskmotes = computed(() => currencyGet('Duskmote'));
  public highestPercentage = computed(() => ascendCurrentPercentage());
  public duskmotesGained = computed(() => ascendCurrencyObtained());

  public showDuskmoteShop() {
    showDuskmoteShop.set(true);
  }

  public ascend() {
    if (!this.canAscend()) return;

    ascendDo();
    this.router.navigate(['/setup']);
  }
}
