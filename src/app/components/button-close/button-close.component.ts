import { Component } from '@angular/core';
import { IconComponent } from '@components/icon/icon.component';
import { SFXDirective } from '@directives/sfx.directive';

@Component({
  selector: 'app-button-close',
  imports: [IconComponent, SFXDirective],
  providers: [],
  templateUrl: './button-close.component.html',
  styleUrl: './button-close.component.scss',
})
export class ButtonCloseComponent {}
