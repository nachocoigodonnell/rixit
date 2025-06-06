import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import CardStack from '../components/CardStack';
import FloatingEffects from '../components/FloatingEffects';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [destination, setDestination] = useState('');

  // Efecto de aparición gradual
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Efecto para manejar la navegación después de la transición
  useEffect(() => {
    if (isTransitioning && destination) {
      const timer = setTimeout(() => {
        navigate(destination);
      }, 450); // Tiempo para que las burbujas se junten
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, destination, navigate]);

  // Función para iniciar la transición
  const handleNavigation = (path: string) => {
    setIsTransitioning(true);
    setDestination(path);
  };

  return (
    <div className="relative overflow-hidden">
      <FloatingEffects transitioning={isTransitioning} />
      <section className="relative z-10 text-center min-h-[80vh] flex flex-col items-center justify-center py-10 px-4">
        <div className={`transform transition-all duration-1000 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-5xl font-fredoka-one pb-2 mb-4 relative">
            <span className="absolute -inset-1 blur-xl bg-gradient-to-r from-primary/50 to-secondary/50 opacity-30 rounded-lg"></span>
            <span className="relative bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            ¡Bienvenid@ a Rixit!
            </span>
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></span>
          </h2>
          <p className="text-white-400 max-w-md mx-auto mb-8">
            Crea historias y adivina las cartas de tus amig@s en este juego de imaginación.
          </p>

            <br/>
            <CardStack entering={!isTransitioning && showContent} transitioning={isTransitioning} />
            <br/>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto mt-8 justify-center items-center">
            <Button
              onClick={() => handleNavigation('/create')}
              className="bg-primary hover:bg-primary/80 text-white transform transition-transform hover:scale-105"
            >
              Crear partida
            </Button>
            <Button
              onClick={() => handleNavigation('/unirse')}
              className="bg-secondary hover:bg-secondary/80 text-white transform transition-transform hover:scale-105"
            >
              Unirse a partida
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-white-500">
            Inspira tu imaginación y cuenta historias con tus amigos.
          </p>
        </div>
      </section>
    </div>
  );
};

export default WelcomePage; 