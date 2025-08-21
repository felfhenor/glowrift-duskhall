import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment.development';
import { liveVersion, localVersion, versionInfoToSemver } from '@helpers';
import { LoggerService } from '@services/logger.service';
import { marked, Renderer } from 'marked';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MetaService {
  private logger = inject(LoggerService);

  public versionString = computed(() => {
    const local = localVersion();
    if (!local) return '';

    return versionInfoToSemver(local);
  });

  public liveVersionString = computed(() => {
    const live = liveVersion();
    if (!live) return '';

    return versionInfoToSemver(live);
  });

  public versionMismatch = computed(
    () =>
      environment.production &&
      this.liveVersionString() &&
      this.versionString() !== this.liveVersionString(),
  );

  public changelogCurrent = signal<string>('');
  public changelogAll = signal<string>('');

  public hasChangelogs = computed(
    () => this.changelogAll() && this.changelogCurrent(),
  );

  private get renderer() {
    const renderer = new Renderer();
    renderer.heading = ({ tokens, depth }) => {
      const text = renderer.parser.parseInline(tokens);

      const sizeClass = [1, 2].includes(depth) ? 'text-xl' : 'text-lg';

      return `
          <h${depth} class="${sizeClass}">
            ${text}
          </h${depth}>`;
    };

    return renderer;
  }

  async init() {
    try {
      const response = await fetch('version.json');
      const versionInfo = await response.json();
      localVersion.set(versionInfo);
    } catch (e) {
      this.logger.error('Meta:Version', 'Failed to load version info', e);
    }

    try {
      const changelog = await fetch('CHANGELOG.md');
      const changelogData = await changelog.text();
      this.changelogAll.set(
        await marked(changelogData, { renderer: this.renderer }),
      );
    } catch {
      this.logger.error(
        'Meta:Changelog',
        'Could not load changelog (all) - probably on local.',
      );
    }

    try {
      const changelog = await fetch('CHANGELOG-current.md');
      const changelogData = await changelog.text();
      this.changelogCurrent.set(
        await marked(changelogData, { renderer: this.renderer }),
      );
    } catch {
      this.logger.error(
        'Meta:Changelog',
        'Could not load changelog (current) - probably on local.',
      );
    }

    interval(15 * 60 * 1000).subscribe(() => {
      this.checkVersionAgainstLiveVersion();
    });
  }

  private async checkVersionAgainstLiveVersion() {
    try {
      const liveVersionFile = await fetch(
        'https://glowriftduskhall.felfhenor.com/version.json',
      );
      const liveVersionData = await liveVersionFile.json();
      liveVersion.set(liveVersionData);
    } catch {
      this.logger.error(
        'Meta:Version',
        'Could not load live version data. Probably not a big deal.',
      );
    }
  }

  public update() {
    window.location.reload();
  }
}
