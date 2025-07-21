import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
  name: 'gameCurrency',
})
export class GameCurrencyPipe implements PipeTransform {
  transform(number: number): string {
    if (number === 0) return '0';
    if (isNaN(number) || !number) return '';

    const rounder = Math.pow(10, 1);
    let abs = Math.floor(Math.abs(number));
    let key = '';

    const powers = [
      { key: 'Q', value: Math.pow(10, 15) },
      { key: 'T', value: Math.pow(10, 12) },
      { key: 'B', value: Math.pow(10, 9) },
      { key: 'M', value: Math.pow(10, 6) },
      { key: 'K', value: 1000 },
    ];

    for (let i = 0; i < powers.length; i++) {
      let reduced = abs / powers[i].value;
      reduced = Math.round(reduced * rounder) / rounder;
      if (reduced >= 1) {
        abs = reduced;
        key = powers[i].key;
        break;
      }
    }

    return `${abs} ${key}`;
  }
}
