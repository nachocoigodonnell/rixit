import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import CardStack from '../components/CardStack';
import FloatingEffects from '../components/FloatingEffects';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  // Efecto de aparición gradual
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <FloatingEffects />
      <section className="text-center min-h-[80vh] flex flex-col items-center justify-center py-10 px-4">
        <div className={`transform transition-all duration-1000 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ¡Bienvenid@ a Rixit!
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Crea historias y adivina las cartas de tus amig@s en este juego de imaginación.
          </p>

            <br/>
            <CardStack />
            <br/>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto mt-8 justify-center items-center">
            <Button
              onClick={() => navigate('/create')}
              className="bg-primary hover:bg-primary/80 text-white transform transition-transform hover:scale-105"
            >
              Crear partida
            </Button>
            <Button
              onClick={() => navigate('/unirse')}
              className="bg-secondary hover:bg-secondary/80 text-white transform transition-transform hover:scale-105"
            >
              Unirse a partida
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-gray-500">
            Inspira tu imaginación y cuenta historias con tus amigos.
          </p>
        </div>
      </section>
    </>
  );
};

export default WelcomePage; 