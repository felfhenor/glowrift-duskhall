import { Directive, HostListener, inject, input } from '@angular/core';
import { AnalyticsService } from '@services/analytics.service';

@Directive({
  selector: '[appAnalyticsClick]',
})
export class AnalyticsClickDirective {
  private analyticsService = inject(AnalyticsService);

  public appAnalyticsClick = input.required<string>();
  public appAnalyticsClickValue = input<number>(1);

  @HostListener('click', ['$event'])
  click() {
    this.analyticsService.sendDesignEvent(
      this.appAnalyticsClick(),
      this.appAnalyticsClickValue(),
    );
  }
}
