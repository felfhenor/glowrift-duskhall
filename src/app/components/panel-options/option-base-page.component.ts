import { getOption, setOption } from '@helpers';
import type { GameOptions } from '@interfaces';

export class OptionsBaseComponent {
  public currentValueForOption(option: keyof GameOptions) {
    return getOption(option);
  }

  public setValueForOption<T extends keyof GameOptions>(
    option: T,
    value: GameOptions[T],
  ) {
    setOption(option, value);
  }

  public setValueForOptionFromRange<T extends keyof GameOptions>(
    option: T,
    event: Event,
  ) {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.setValueForOption(option, value as GameOptions[T]);
  }
}
