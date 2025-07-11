import { effect, Injectable } from '@angular/core';
import { getOption, windowHeight, windowWidth } from '@helpers';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {
    effect(() => {
      const theme = getOption('uiTheme');
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  private handleResize() {
    windowWidth.set(window.innerWidth);
    windowHeight.set(window.innerHeight);
  }

  init() {
    this.handleResize();

    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
}
