import React, { useMemo } from 'react';

interface CardStackProps {
  entering?: boolean;      // true cuando la página aparece
  transitioning?: boolean; // true cuando vamos a navegar
}

const CardStack: React.FC<CardStackProps> = ({ entering = false, transitioning = false }) => {
  // Generamos valores aleatorios para shuffle una sola vez por render
  const shuffleTransforms = useMemo(
    () => [...Array(5)].map(() => ({
      tx: Math.random() * 40 - 20, // -20..20 px
      ty: Math.random() * 40 - 20,
      rot: Math.random() * 30 - 15, // -15..15 deg
    })),
    []
  );

  return (
    <div className="relative w-60 h-80 mx-auto my-8">
      {/* Tarjetas apiladas con animación */}
      {[...Array(5)].map((_, i) => {
        // Offset base como antes
        const baseRotation = -4 + i * 2;
        const baseTranslateY = i * 4;

        // TRANSFORMACIONES
        let transform = `rotate(${baseRotation}deg) translateY(${baseTranslateY}px)`;
        let opacity = 1;
        let transition = 'transform .6s ease, opacity .6s ease';
        let delay = `${i * 0.1}s`;

        if (!entering) {
          // Fase inicial antes de aparecer
          transform += ' scale(0)';
          opacity = 0;
          transition = 'transform .6s ease, opacity .6s ease';
          delay = `${0.2 + i * 0.1}s`;
        }

        if (transitioning) {
          // Shuffle y desaparecer
          const s = shuffleTransforms[i];
          transform = `rotate(${baseRotation + s.rot}deg) translate(${s.tx}px, ${s.ty}px) scale(0.2)`;
          opacity = 0;
          transition = 'transform .6s ease, opacity .6s ease .1s';
          delay = '0s';
        }

        return (
          <div
            key={i}
            className={`absolute rounded-2xl shadow-xl w-full h-full transition-all duration-700 ease-in-out
             ${i === 0 ? 'bg-white' : `bg-gradient-to-br animate-pulse ${getCardColor(i)}`}`}
            style={{
              transform,
              opacity,
              transitionDelay: delay,
              zIndex: 5 - i,
            }}
          >
            <div className={`absolute inset-2 rounded-xl ${i === 0 ? '' : 'bg-opacity-20 bg-white'} flex items-center justify-center overflow-hidden`}>
              <div className={`absolute w-32 h-32 rounded-full ${i === 0 ? 'bg-gray-100/80' : 'bg-white/10'} blur-xl`} />
              {i === 0 && (
                <div className="flex items-center justify-center transform -rotate-6">
                  <img
                    src="/image/rixit-logo.png"
                    alt="Rixit Logo"
                    className="w-28 h-auto drop-shadow-lg animate-[gentle-float_5s_ease-in-out_infinite]"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Función para obtener diferentes colores para las cartas
const getCardColor = (index: number): string => {
  const colors = [
    'from-primary to-purple-600',
    'from-secondary to-red-600',
    'from-blue-600 to-primary',
    'from-indigo-600 to-purple-600',
    'from-purple-600 to-secondary',
  ];
  return colors[index % colors.length];
};

export default CardStack; 