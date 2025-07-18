import { Component, computed, input } from '@angular/core';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';
import { indexToSprite, spriteIterationCount } from '@helpers';
import { AtlasedImage } from '@interfaces';

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

  public shouldAnimate = input<boolean>(true);

  public currentAssetName = computed(() =>
    this.shouldAnimate()
      ? indexToSprite(
          +this.assetName() + (spriteIterationCount() % this.frames()),
        )
      : indexToSprite(+this.assetName()),
  );
}
