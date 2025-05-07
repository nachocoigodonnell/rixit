import React from 'react';

const FloatingEffects: React.FC = () => {
  // Crear varios elementos flotantes con formas distintas
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full opacity-60 ${getRandomShape(i)} border border-white/20`}
          style={{
            width: `${getRandomSize()}px`,
            height: `${getRandomSize()}px`,
            background: getRandomGradient(),
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite alternate`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        />
      ))}
      {/* Elemento de prueba para verificar que el componente se renderiza */}
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs opacity-70 z-50">
        FX activo
      </div>
    </div>
  );
};

// Generar tamaños aleatorios para las burbujas
const getRandomSize = (): number => {
  return 50 + Math.random() * 150;
};

// Generar gradientes aleatorios basados en los colores del tema
const getRandomGradient = (): string => {
  const gradients = [
    'radial-gradient(circle, rgba(100, 108, 255, 0.7) 0%, rgba(100, 108, 255, 0) 70%)',
    'radial-gradient(circle, rgba(255, 100, 108, 0.7) 0%, rgba(255, 100, 108, 0) 70%)',
    'radial-gradient(circle, rgba(148, 100, 255, 0.7) 0%, rgba(148, 100, 255, 0) 70%)',
    'radial-gradient(circle, rgba(100, 200, 255, 0.7) 0%, rgba(100, 200, 255, 0) 70%)',
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

// Generar diferentes formas
const getRandomShape = (index: number): string => {
  // Alternar entre círculo y cuadrado redondeado
  return index % 3 === 0 ? 'rounded-3xl' : 'rounded-full';
};

export default FloatingEffects; 