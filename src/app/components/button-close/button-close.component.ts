import { Component, output } from '@angular/core';
import { IconComponent } from '@components/icon/icon.component';

@Component({
  selector: 'app-button-close',
  imports: [IconComponent],
  providers: [],
  templateUrl: './button-close.component.html',
  styleUrl: './button-close.component.scss',
})
export class ButtonCloseComponent {
  public close = output<void>();
}
