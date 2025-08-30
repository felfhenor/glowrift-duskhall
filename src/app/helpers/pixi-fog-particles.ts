import { Particle, Texture } from 'pixi.js';
import type { ParticleContainer } from 'pixi.js';

interface FogParticle extends Particle {
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
  fogParticleContainer: ParticleContainer,
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
  const particles: FogParticle[] = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = new Particle({
      texture: smokeTexture,
      x: 0,
      y: 0,
      scaleX: 0.3 + Math.random() * 0.4,
      scaleY: 0.3 + Math.random() * 0.4,
      anchorX: 0.5,
      anchorY: 0.5,
      tint: 0x999999, // Gray smoke color
      alpha: 0.6,     // Initial alpha
      rotation: 0
    }) as FogParticle;
    
    // Random position around the center point
    const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
    const distance = Math.random() * 8;
    
    particle.x = screenX + Math.cos(angle) * distance;
    particle.y = screenY + Math.sin(angle) * distance;
    
    // Add random velocity for animation
    particle.vx = Math.cos(angle) * (0.5 + Math.random() * 0.5);
    particle.vy = Math.sin(angle) * (0.5 + Math.random() * 0.5) - 0.5; // Slight upward bias
    particle.life = 1.0;
    particle.decay = 0.02 + Math.random() * 0.01;
    
    fogParticleContainer.addParticle(particle);
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
        
        // Update alpha directly
        particle.alpha = Math.max(0, particle.life * 0.6);
        
        // Gradually expand
        const scaleMultiplier = 1.02;
        particle.scaleX *= scaleMultiplier;
        particle.scaleY *= scaleMultiplier;
        
        // Add some upward drift
        particle.vy -= 0.01;
      }
      
      // Clean up when all particles are dead
      if (allDead) {
        app.ticker.remove(animationTicker);
        particles.forEach(particle => {
          fogParticleContainer.removeParticle(particle);
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
  fogParticleContainer: ParticleContainer,
): void {
  // Remove all particles using the proper ParticleContainer API
  fogParticleContainer.removeParticles();
}