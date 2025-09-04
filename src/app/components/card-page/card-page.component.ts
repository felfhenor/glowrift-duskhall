import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

type CardSize = 'main' | 'sub' | 'heroes' | 'heroes-sub';

@Component({
  selector: 'app-card-page',
  imports: [CommonModule],
  templateUrl: './card-page.component.html',
  styleUrl: './card-page.component.scss',
})
export class CardPageComponent {
  public heightProfile = input<CardSize>('main');

  public isEmbeddedInModal = input<boolean>(false);
}
