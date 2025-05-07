import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { useToast } from '../hooks/useToast';
import { useGameStore } from '../store/useGameStore';

interface FormState {
  gameCode: string;
  playerName: string;
}

interface FormErrors {
  gameCode?: string;
  playerName?: string;
}

const initialState: FormState = { gameCode: '', playerName: '' };

/**
 * Page for joining an existing game.
 */
const JoinGamePage: React.FC = () => {
  const params = useParams<{ gameCode?: string }>();
  const [form, setForm] = useState<FormState>({
    gameCode: params.gameCode || '',
    playerName: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();
  const toast = useToast();
  const { joinGame, isLoading } = useGameStore();
  const [showContent, setShowContent] = useState(false);

  // Efecto de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!/^[A-Za-z0-9]{4,6}$/.test(form.gameCode)) {
      newErrors.gameCode = 'El código debe tener 4-6 caracteres alfanuméricos';
    }
    if (!/^.{3,15}$/.test(form.playerName)) {
      newErrors.playerName = 'El nombre debe tener entre 3 y 15 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await joinGame(form.gameCode.toUpperCase(), form.playerName);
      toast.showSuccess('¡Te has unido al juego!');
      
      // Redireccionar al juego
      navigate(`/lobby/${form.gameCode.toUpperCase()}`);
    } catch (error) {
      // Error already handled by the store
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center">
      <div className="relative z-10 container max-w-5xl mx-auto px-4 py-12">
        <div className={`flex flex-col md:flex-row-reverse items-center gap-10 transform transition-all duration-700 ease-out ${
          showContent ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
        }`}>

          {/* Columna derecha: Formulario */}
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl font-semibold mb-6 text-center md:text-right">
              Unirse a partida
            </h2>
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              noValidate
            >
              {/* Game code */}
              <div className="flex flex-col">
                <label htmlFor="gameCode" className="mb-1 font-medium">
                  Código del Juego
                </label>
                <input
                  id="gameCode"
                  name="gameCode"
                  type="text"
                  value={form.gameCode}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.gameCode)}
                  className="px-3 py-2 rounded border border-gray-700 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                />
                {errors.gameCode && (
                  <span role="alert" className="text-red-500 text-sm mt-1">
                    {errors.gameCode}
                  </span>
                )}
              </div>

              {/* Player name */}
              <div className="flex flex-col">
                <label htmlFor="playerName" className="mb-1 font-medium">
                  Nombre de Jugador
                </label>
                <input
                  id="playerName"
                  name="playerName"
                  type="text"
                  value={form.playerName}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.playerName)}
                  className="px-3 py-2 rounded border border-gray-700 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                {errors.playerName && (
                  <span role="alert" className="text-red-500 text-sm mt-1">
                    {errors.playerName}
                  </span>
                )}
              </div>

              {/* Button */}
              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-secondary hover:bg-secondary/80 text-white w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {isLoading && <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full" />}
                  Unirse al Juego
                </Button>
              </div>
            </form>

            {/* Botón volver */}
            <div className="pt-4 text-right">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
            </div>
          </div>

          {/* Columna izquierda: Imagen */}
          <div className={`w-full md:w-1/2 transform transition-all duration-700 ease-out delay-200 ${
            showContent ? 'translate-x-0 opacity-100' : 'translate-x-40 opacity-0'
          }`}>
            <img
              src="/image/join-game-illustration.png"
              alt="Ilustración unirse a partida"
              className="w-full h-auto rounded-2xl shadow-2xl object-cover"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default JoinGamePage; 