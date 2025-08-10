import { Component, computed, inject, input } from '@angular/core';
import type { AtlasedImage } from '@interfaces';
import { ContentService } from '@services/content.service';

@Component({
  selector: 'app-atlas-animation',
  imports: [],
  templateUrl: './atlas-animation.component.html',
  styleUrl: './atlas-animation.component.scss',
})
export class AtlasAnimationComponent {
  private contentService = inject(ContentService);

  public spritesheet = input.required<AtlasedImage>();
  public assetName = input.required<string>();
  public frames = input<number>(4);

  public assetPath = computed(
    () => `gameassets/${this.spritesheet()}/${this.assetName()}.png`,
  );
  public assetJSON = computed(
    () => this.contentService.artAtlases()[this.spritesheet()],
  );
  public specificAsset = computed(
    () => this.assetJSON()[this.assetPath()] ?? { width: 0, height: 0 },
  );

  public assetUrl = computed(
    () => `art/spritesheets/${this.spritesheet()}.webp`,
  );
  public assetFrames = computed(() => this.frames());
  public assetOffsetY = computed(() => this.specificAsset().y / 64);
  public totalAnimationDuration = computed(() => this.frames() * 100);
}
