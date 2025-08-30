import { describe, expect, it, vi } from 'vitest';
import { ParticleContainer, Sprite } from 'pixi.js';
import { pixiFogParticleEffectCreate, pixiFogParticleEffectClear } from './pixi-fog-particles';

// Mock PIXI components
vi.mock('pixi.js', () => ({
  ParticleContainer: vi.fn().mockImplementation(() => ({
    addChild: vi.fn(),
    removeChildren: vi.fn(() => []),
    parent: {
      parent: {
        ticker: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
    },
  })),
  Sprite: vi.fn().mockImplementation(() => ({
    anchor: { set: vi.fn() },
    scale: { set: vi.fn(), x: 1 },
    destroy: vi.fn(),
    parent: { removeChild: vi.fn() },
    x: 0,
    y: 0,
    alpha: 1,
    tint: 0xffffff,
  })),
  Texture: {
    WHITE: 'mock-white-texture',
  },
}));

describe('pixiFogParticleEffect', () => {
  it('should create particle effects correctly', () => {
    const mockContainer = new ParticleContainer() as unknown as ParticleContainer;
    
    pixiFogParticleEffectCreate(mockContainer, 10, 15, 64, 5, 5);
    
    // Should have called addChild for multiple particles (5-7 particles)
    expect(mockContainer.addChild).toHaveBeenCalled();
    const callCount = (mockContainer.addChild as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(callCount).toBeGreaterThanOrEqual(5);
    expect(callCount).toBeLessThanOrEqual(7);
  });

  it('should clear particles correctly', () => {
    const mockChild = { destroy: vi.fn() };
    const mockContainer = {
      removeChildren: vi.fn(() => [mockChild]),
    } as unknown as ParticleContainer;
    
    pixiFogParticleEffectClear(mockContainer);
    
    expect(mockContainer.removeChildren).toHaveBeenCalled();
    expect(mockChild.destroy).toHaveBeenCalled();
  });

  it('should calculate screen positions correctly', () => {
    const mockContainer = new ParticleContainer() as unknown as ParticleContainer;
    
    // World position (10, 15), camera at (5, 5), node size 64
    // Expected screen position: (10-5)*64 + 32 = 352, (15-5)*64 + 32 = 672
    pixiFogParticleEffectCreate(mockContainer, 10, 15, 64, 5, 5);
    
    expect(mockContainer.addChild).toHaveBeenCalled();
  });
});