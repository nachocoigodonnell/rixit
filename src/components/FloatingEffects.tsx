import React, { useState } from 'react';

interface FloatingEffectsProps {
  transitioning?: boolean;
}

const blobColors = [
  'rgba(100,108,255,0.6)',   // primario
  'rgba(255,100,108,0.6)',   // secundario
  'rgba(148,100,255,0.6)',
  'rgba(100,200,255,0.6)',
];

const FloatingEffects: React.FC<FloatingEffectsProps> = ({ transitioning = false }) => {
  // Generamos blobs con posiciones y tamaños iniciales consistentes
  const [blobs] = useState(() =>
    Array.from({ length: 8 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 200 + Math.random() * 200, // 200-400 px
      duration: 8 + Math.random() * 8, // 8-16 s
      delay: Math.random() * 4,
      color: blobColors[Math.floor(Math.random() * blobColors.length)],
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {blobs.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full mix-blend-screen blur-2xl"
          style={{
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            background: blob.color,
            left: transitioning ? '50%' : `${blob.left}%`,
            top: transitioning ? '50%' : `${blob.top}%`,
            transform: transitioning
              ? 'translate(-50%, -50%) scale(0.3)'
              : 'translate(-50%, -50%)',
            transition: 'transform 0.8s ease, left 0.8s ease, top 0.8s ease',
            animation: transitioning
              ? 'none'
              : `blobMorph ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingEffects; 