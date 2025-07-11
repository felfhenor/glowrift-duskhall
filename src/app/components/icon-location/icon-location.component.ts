import { Component, computed, input } from '@angular/core';
import { getSpriteFromNodeType } from '@helpers';
import { LocationType } from '@interfaces';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';

@Component({
  selector: 'app-icon-location',
  imports: [AtlasImageComponent],
  templateUrl: './icon-location.component.html',
  styleUrl: './icon-location.component.scss',
})
export class IconLocationComponent {
  public type = input.required<LocationType>();
  public sprite = computed(() => getSpriteFromNodeType(this.type()));
}
