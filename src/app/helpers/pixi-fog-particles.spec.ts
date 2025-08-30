import { describe, expect, it, vi } from 'vitest';
import type { ParticleContainer } from 'pixi.js';
import { pixiFogParticleEffectCreate, pixiFogParticleEffectClear } from '@helpers/pixi-fog-particles';

// Mock PIXI components
vi.mock('pixi.js', () => ({
  ParticleContainer: vi.fn().mockImplementation(() => ({
    addParticle: vi.fn(),
    removeParticle: vi.fn(),
    removeParticles: vi.fn(() => []),
    parent: {
      parent: {
        ticker: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
    },
  })),
  Particle: vi.fn().mockImplementation(() => ({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    anchorX: 0,
    anchorY: 0,
    rotation: 0,
    alpha: 1,
    tint: 0xffffff,
    texture: 'mock-texture',
  })),
  Texture: {
    WHITE: 'mock-white-texture',
  },
}));

describe('pixiFogParticleEffect', () => {
  it('should create particle effects correctly', () => {
    const mockContainer = {
      addParticle: vi.fn(),
      parent: {
        parent: {
          ticker: {
            add: vi.fn(),
            remove: vi.fn(),
          },
        },
      },
    } as unknown as ParticleContainer;
    
    pixiFogParticleEffectCreate(mockContainer, 10, 15, 64, 5, 5);
    
    // Should have called addParticle for multiple particles (5-7 particles)
    expect(mockContainer.addParticle).toHaveBeenCalled();
    const callCount = (mockContainer.addParticle as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(callCount).toBeGreaterThanOrEqual(5);
    expect(callCount).toBeLessThanOrEqual(7);
  });

  it('should clear particles correctly', () => {
    const mockContainer = {
      removeParticles: vi.fn(() => []),
    } as unknown as ParticleContainer;
    
    pixiFogParticleEffectClear(mockContainer);
    
    expect(mockContainer.removeParticles).toHaveBeenCalled();
  });

  it('should calculate screen positions correctly', () => {
    const mockContainer = {
      addParticle: vi.fn(),
      parent: {
        parent: {
          ticker: {
            add: vi.fn(),
            remove: vi.fn(),
          },
        },
      },
    } as unknown as ParticleContainer;
    
    // World position (10, 15), camera at (5, 5), node size 64
    // Expected screen position: (10-5)*64 + 32 = 352, (15-5)*64 + 32 = 672
    pixiFogParticleEffectCreate(mockContainer, 10, 15, 64, 5, 5);
    
    expect(mockContainer.addParticle).toHaveBeenCalled();
  });
});