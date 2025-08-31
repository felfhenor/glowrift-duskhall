import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { analyticsEvent$ } from '@helpers';
import { MetaService } from '@services/meta.service';
import gameanalytics from 'gameanalytics';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private metaService = inject(MetaService);

  private analytics: typeof gameanalytics.GameAnalytics;

  init() {
    if (environment.gameanalytics.game && environment.gameanalytics.secret) {
      this.analytics = gameanalytics.GameAnalytics;
      this.analytics.configureBuild(
        `${environment.platform} ${this.metaService.versionString()}`,
      );
      this.analytics.initialize(
        environment.gameanalytics.game,
        environment.gameanalytics.secret,
      );

      analyticsEvent$.subscribe(({ event, value }) => {
        this.sendDesignEvent(event, value ?? 1);
      });
    }
  }

  sendDesignEvent(eventId: string, value: number = 0) {
    const eventIdOnlyText = eventId.replace(/[^a-zA-Z0-9:]/g, '');
    this.analytics?.addDesignEvent(eventIdOnlyText, value);
  }
}
