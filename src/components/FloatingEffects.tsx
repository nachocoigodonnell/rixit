import React from 'react';

const FloatingEffects: React.FC = () => {
  // Crear varias burbujas flotantes
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full shadow-xl opacity-30 transition-all duration-700 ease-in-out"
          style={{
            width: `${getRandomBubbleSize()}px`,
            height: `${getRandomBubbleSize()}px`,
            background: getBubbleGradient(i % 4),
            backdropFilter: 'blur(2px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite alternate`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.3), 0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Brillo de la burbuja */}
          <div className="absolute w-1/3 h-1/3 bg-white rounded-full opacity-40 top-1/4 left-1/4 blur-sm">
          </div>
        </div>
      ))}
    </div>
  );
};

// Generar tamaños aleatorios para las burbujas
const getRandomBubbleSize = (): number => {
  return 150 + Math.random() * 2; // Tamaños entre 20px y 100px
};

// Gradientes para las burbujas
const getBubbleGradient = (index: number): string => {
  const gradients = [
    'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), rgba(100, 108, 255, 0.1))',
    'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), rgba(255, 100, 108, 0.1))',
    'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), rgba(148, 100, 255, 0.1))',
    'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), rgba(100, 200, 255, 0.1))'
  ];
  return gradients[index];
};

export default FloatingEffects; 