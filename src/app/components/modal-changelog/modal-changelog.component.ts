import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalComponent } from '@components/modal/modal.component';
import { SFXDirective } from '@directives/sfx.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerPackage } from '@ng-icons/tabler-icons';
import { TippyDirective } from '@ngneat/helipopper';
import { MetaService } from '@services/meta.service';

@Component({
  selector: 'app-modal-changelog',
  imports: [NgIconComponent, TippyDirective, SFXDirective, ModalComponent],
  providers: [provideIcons({ tablerPackage })],
  templateUrl: './modal-changelog.component.html',
  styleUrl: './modal-changelog.component.scss',
})
export class ModalChangelogComponent {
  private meta = inject(MetaService);
  private sanitizer = inject(DomSanitizer);

  public readonly color = '#089000';
  public currentColor = '#ccc';

  public showChangelog = signal<boolean>(false);
  public currentView = signal<'all' | 'recent'>('recent');

  public text = computed(() =>
    this.currentView() === 'recent'
      ? this.meta.changelogCurrent()
      : this.meta.changelogAll(),
  );
  public safeHtml = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.text()),
  );
}
