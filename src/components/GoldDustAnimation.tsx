import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  opacity: number;
  type: 'sparkle' | 'dot' | 'star';
  color: string;
}

interface GoldDustAnimationProps {
  active: boolean;
  durationMs?: number;
  particleCount?: number;
  onComplete?: () => void;
  className?: string;
}

export const GoldDustAnimation: React.FC<GoldDustAnimationProps> = ({
  active,
  durationMs = 3200,
  particleCount = 38,
  onComplete,
  className = '',
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const goldColors = [
      '#FFDF73', // Bright champagne gold
      '#D4AF37', // Imperial metallic gold
      '#C29C6D', // Warm luxury gold
      '#F3E5AB', // Soft vanilla gold
      '#FFE8A3', // Sparkling shimmer
    ];

    const types: ('sparkle' | 'dot' | 'star')[] = ['sparkle', 'dot', 'star', 'dot'];

    const newParticles: Particle[] = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 60,
      size: Math.random() * 8 + 3,
      duration: 1.6 + Math.random() * 1.6,
      delay: Math.random() * 0.8,
      opacity: 0.7 + Math.random() * 0.3,
      type: types[Math.floor(Math.random() * types.length)],
      color: goldColors[Math.floor(Math.random() * goldColors.length)],
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [active, durationMs, particleCount, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Ambient golden luxury flash glow */}
      <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-transparent animate-pulse" />

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `goldDustFloat ${p.duration}s cubic-bezier(0.25, 1, 0.5, 1) ${p.delay}s forwards`,
          }}
        >
          {p.type === 'sparkle' ? (
            <span
              style={{
                color: p.color,
                fontSize: `${p.size + 6}px`,
                textShadow: `0 0 10px ${p.color}, 0 0 20px #D4AF37`,
              }}
              className="inline-block animate-spin"
            >
              ✦
            </span>
          ) : p.type === 'star' ? (
            <span
              style={{
                color: p.color,
                fontSize: `${p.size + 4}px`,
                textShadow: `0 0 12px ${p.color}`,
              }}
              className="inline-block"
            >
              ✨
            </span>
          ) : (
            <div
              className="rounded-full shadow-lg"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 12px ${p.color}, 0 0 24px rgba(212, 175, 55, 0.6)`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
