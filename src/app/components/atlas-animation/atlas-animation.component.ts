import { Component, computed, input } from '@angular/core';
import { indexToSprite, spriteIterationCount } from '@helpers';
import { AtlasedImage } from '@interfaces';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';

@Component({
  selector: 'app-atlas-animation',
  imports: [AtlasImageComponent],
  templateUrl: './atlas-animation.component.html',
  styleUrl: './atlas-animation.component.scss',
})
export class AtlasAnimationComponent {
  public spritesheet = input.required<AtlasedImage>();
  public assetName = input.required<string>();
  public frames = input<number>(4);

  public currentAssetName = computed(() =>
    indexToSprite(+this.assetName() + (spriteIterationCount() % this.frames())),
  );
}
