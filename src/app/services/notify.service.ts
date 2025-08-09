import { inject, Injectable } from '@angular/core';
import { notification$ } from '@helpers';
import { HotToastService } from '@ngxpert/hot-toast';
import { LoggerService } from '@services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  private logger = inject(LoggerService);
  private toast = inject(HotToastService);

  async init() {
    notification$.subscribe((messageData) => {
      const { message, type } = messageData;
      this.logger.debug('Notify', message);

      this.toast?.[type]?.(message, {});
    });
  }
}
