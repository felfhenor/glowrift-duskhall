export type GameElement = 'Fire' | 'Water' | 'Earth' | 'Air';

export type GameElementExtended =
  | 'Sand'
  | 'Molten'
  | 'Mist'
  | 'Heat'
  | 'Steam'
  | 'Mud'
  | 'Holy';

export type ElementBlock = Record<GameElement, number>;
