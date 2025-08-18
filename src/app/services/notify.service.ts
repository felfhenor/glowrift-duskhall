import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { notification$ } from '@helpers';
import { LoggerService } from '@services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  private logger = inject(LoggerService);
  private toast = inject(ToastrService);

  async init() {
    notification$.subscribe((messageData) => {
      const { message, type } = messageData;
      this.logger.debug(`Notify:${type}`, message);

      this.toast?.[type]?.(message);
    });
  }
}
