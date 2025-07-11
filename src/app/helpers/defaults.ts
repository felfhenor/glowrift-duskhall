import { ElementBlock, StatBlock } from '../interfaces';

export function getDefaultStats(): StatBlock {
  return {
    Aura: 0,
    Force: 0,
    Health: 0,
    Speed: 0,
  };
}

export function getDefaultAffinities(): ElementBlock {
  return {
    Air: 1,
    Earth: 1,
    Fire: 1,
    Water: 1,
  };
}
