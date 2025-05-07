import React from 'react';

const CardStack: React.FC = () => {
  return (
    <div className="relative w-60 h-80 mx-auto my-8">
      {/* Tarjetas apiladas con animación */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-2xl shadow-xl w-full h-full transition-all duration-700 ease-in-out
           bg-gradient-to-br ${ i == 4 ? 'animate-pulse' : ''} ${getCardColor(i)}`}
          style={{
            transform: `rotate(${-4 + i * 2}deg) translateY(${i * 4}px)`,
            zIndex: 5 - i,
            animationDelay: `${i * 0.7}s`,
            animationDuration: '3s',
          }}
        >
          <div className="absolute inset-2 rounded-xl bg-opacity-20 bg-white flex items-center justify-center overflow-hidden">
            <div className="absolute w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
            {i === 0 && (
              <div className="flex items-center justify-center transform -rotate-6">
                <img 
                  src="/image/rixit-logo.png" 
                  alt="Rixit Logo" 
                  className="w-28 h-auto drop-shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Función para obtener diferentes colores para las cartas
const getCardColor = (index: number): string => {
  const colors = [
    'bg-white',
    'from-secondary to-red-600',
    'from-blue-600 to-primary',
    'from-indigo-600 to-purple-600',
    'from-purple-600 to-secondary',
  ];
  return colors[index % colors.length];
};

export default CardStack; 