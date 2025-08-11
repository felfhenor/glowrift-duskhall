import { Component, computed, input } from '@angular/core';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';
import { spriteGetFromNodeType } from '@helpers';
import type { LocationType } from '@interfaces';

@Component({
  selector: 'app-icon-location',
  imports: [AtlasImageComponent],
  templateUrl: './icon-location.component.html',
  styleUrl: './icon-location.component.scss',
})
export class IconLocationComponent {
  public type = input.required<LocationType>();
  public sprite = computed(() => spriteGetFromNodeType(this.type()));
}
