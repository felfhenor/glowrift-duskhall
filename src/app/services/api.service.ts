import { Injectable } from '@angular/core';

import * as helpers from '@helpers';

@Injectable({
  providedIn: 'root',
})
export class APIService {
  async init() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).api = helpers;
  }
}
