import { Component, input } from '@angular/core';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';

@Component({
  selector: 'app-icon-combat-sprite',
  imports: [AtlasImageComponent],
  templateUrl: './icon-combat-sprite.component.html',
  styleUrl: './icon-combat-sprite.component.scss',
})
export class IconSpriteCombatComponent {
  public spritesheet = input.required<'hero' | 'guardian'>();
  public sprite = input.required<string>();
}
