import { Sprite, Texture } from 'pixi.js';
import type { Container } from 'pixi.js';

interface ParticleSprite extends Sprite {
  vx: number;
  vy: number;
  life: number;
  decay: number;
}

interface PixiApplication {
  ticker: {
    add: (fn: () => void) => void;
    remove: (fn: () => void) => void;
  };
}

/**
 * Creates a smoke particle effect at the specified world position
 * @param fogParticleContainer The particle container to add effects to
 * @param worldX World X coordinate
 * @param worldY World Y coordinate
 * @param nodeSize Size of a single map node in pixels
 * @param cameraX Camera X offset
 * @param cameraY Camera Y offset
 */
export function pixiFogParticleEffectCreate(
  fogParticleContainer: Container,
  worldX: number,
  worldY: number,
  nodeSize: number,
  cameraX: number,
  cameraY: number,
): void {
  // Calculate screen position from world position
  const screenX = (worldX - Math.floor(cameraX)) * nodeSize + nodeSize / 2;
  const screenY = (worldY - Math.floor(cameraY)) * nodeSize + nodeSize / 2;

  // Generate texture from graphics for reuse
  const smokeTexture = Texture.WHITE; // Use white texture and tint instead

  // Create multiple smoke particles for a puff effect
  const particleCount = 5 + Math.floor(Math.random() * 3); // 5-7 particles
  const particles: ParticleSprite[] = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = new Sprite(smokeTexture) as ParticleSprite;
    
    // Random position around the center point
    const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
    const distance = Math.random() * 8;
    
    particle.x = screenX + Math.cos(angle) * distance;
    particle.y = screenY + Math.sin(angle) * distance;
    particle.anchor.set(0.5);
    particle.scale.set(0.3 + Math.random() * 0.4);
    particle.alpha = 0.6;
    particle.tint = 0x999999; // Gray smoke color
    
    // Add random velocity for animation
    particle.vx = Math.cos(angle) * (0.5 + Math.random() * 0.5);
    particle.vy = Math.sin(angle) * (0.5 + Math.random() * 0.5) - 0.5; // Slight upward bias
    particle.life = 1.0;
    particle.decay = 0.02 + Math.random() * 0.01;
    
    fogParticleContainer.addChild(particle);
    particles.push(particle);
  }

  // Animate particles using the ticker
  const app = fogParticleContainer.parent?.parent as unknown as PixiApplication;
  if (app?.ticker) {
    const animationTicker = () => {
      let allDead = true;
      
      for (const particle of particles) {
        if (particle.life <= 0) continue;
        
        allDead = false;
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Update life and appearance
        particle.life -= particle.decay;
        particle.alpha = particle.life * 0.6;
        particle.scale.set(particle.scale.x * 1.02); // Gradually expand
        
        // Add some upward drift
        particle.vy -= 0.01;
      }
      
      // Clean up when all particles are dead
      if (allDead) {
        app.ticker.remove(animationTicker);
        particles.forEach(particle => {
          if (particle.parent) {
            particle.parent.removeChild(particle);
          }
          particle.destroy();
        });
      }
    };
    
    app.ticker.add(animationTicker);
  }
}

/**
 * Clears all particles from the fog particle container
 * @param fogParticleContainer The particle container to clear
 */
export function pixiFogParticleEffectClear(
  fogParticleContainer: Container,
): void {
  fogParticleContainer.removeChildren().forEach((child) => {
    child.destroy();
  });
}