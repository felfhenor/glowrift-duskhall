import { getOption, setOption } from '@helpers';
import type { GameOptions } from '@interfaces';

export class OptionsBaseComponent {
  public getOption<T extends keyof GameOptions>(option: T) {
    return getOption(option);
  }

  public setOption<T extends keyof GameOptions>(
    option: T,
    value: GameOptions[T],
  ) {
    setOption(option, value);
  }
}
