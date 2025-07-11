import {
  GameStat,
  Guardian,
  GuardianContent,
  WorldLocation,
} from '../interfaces';

export function createGuardianForLocation(
  location: WorldLocation,
  guardianData: GuardianContent,
): Guardian {
  const stats: Record<GameStat, number> = {
    Aura: location.encounterLevel * guardianData.statScaling.Aura,
    Force: location.encounterLevel * guardianData.statScaling.Force,
    Health: location.encounterLevel * guardianData.statScaling.Health,
    Speed: location.encounterLevel * guardianData.statScaling.Speed,
  };

  return {
    ...guardianData,
    hp: stats.Health,
    stats,
  };
}
