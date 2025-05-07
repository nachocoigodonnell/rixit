import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useToast } from '../hooks/useToast';
import { useGameStore } from '../store/useGameStore';

interface FormState {
  playerName: string;
  playerCount: number;
}

interface FormErrors {
  playerName?: string;
  playerCount?: string;
}

const initialState: FormState = { playerName: '', playerCount: 4 };

/**
 * Page for creating a new game.
 */
const CreateGamePage: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();
  const toast = useToast();
  const { createGame, isLoading } = useGameStore();
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

    if (!/^.{3,15}$/.test(form.playerName)) {
      newErrors.playerName = 'Nombre de jugador debe tener entre 3 y 15 caracteres';
    }

    if (form.playerCount < 3 || form.playerCount > 6) {
      newErrors.playerCount = 'El número de jugadores debe estar entre 3 y 6';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;

    if (name === 'playerCount') {
      setForm({ ...form, playerCount: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createGame(form.playerName, form.playerCount);
      toast.showSuccess('¡Juego creado exitosamente!');
      
      // Obtener el código de juego del sessionStorage para redireccionar
      const gameCode = sessionStorage.getItem('gameCode');
      if (gameCode) {
        navigate(`/lobby/${gameCode}`);
      }
    } catch (error: unknown) {
      // Error already handled by the store
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center">
      <div className="relative z-10 container max-w-5xl mx-auto px-4 py-12">
        <div className={`flex flex-col md:flex-row items-center gap-10 transform transition-all duration-700 ease-out ${
          showContent ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
        }`}>

          {/* Columna izquierda: Formulario */}
          <div className="w-full md:w-1/2 lg:w-2/5">
            <h2 className="text-4xl font-semibold mb-6 text-center md:text-left">
              Crear partida
            </h2>
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              noValidate
            >
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
                  className="px-3 py-2 rounded border border-gray-700 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.playerName && (
                  <span role="alert" className="text-red-500 text-sm mt-1">
                    {errors.playerName}
                  </span>
                )}
              </div>

              {/* Player count */}
              <div className="flex flex-col">
                <label htmlFor="playerCount" className="mb-1 font-medium">
                  Número de Jugadores
                </label>
                <select
                  id="playerCount"
                  name="playerCount"
                  value={form.playerCount}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.playerCount)}
                  className="px-3 py-2 rounded border border-gray-700 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  {[3, 4, 5, 6].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
                {errors.playerCount && (
                  <span role="alert" className="text-red-500 text-sm mt-1">
                    {errors.playerCount}
                  </span>
                )}
              </div>

              {/* Create button */}
              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/80 text-white w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {isLoading && (
                    <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
                  )}
                  Crear Juego
                </Button>
              </div>
            </form>

            {/* Botón volver */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
            </div>
          </div>

          {/* Columna derecha: Imagen */}
          <div className={`w-full md:w-1/2 lg:w-3/5 transform transition-all duration-700 ease-out delay-200 ${
            showContent ? 'translate-x-0 opacity-100' : '-translate-x-40 opacity-0'
          }`}>
            <img
              src="/image/create-game.png"
              alt="Crear partida"
              className="w-full h-auto md:scale-125 lg:scale-140 md:-my-16 lg:-my-20 object-contain"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateGamePage; 