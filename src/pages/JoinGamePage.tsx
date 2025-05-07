import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinGame } from '../api';
import Button from '../components/Button';
import { useToast } from '../hooks/useToast';

interface FormState {
  gameCode: string;
  playerName: string;
}

const initialState: FormState = { gameCode: '', playerName: '' };

/**
 * Página para unirse a una partida existente.
 */
const JoinGamePage: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};

    if (!/^[a-zA-Z0-9]{4,6}$/.test(form.gameCode)) {
      newErrors.gameCode = 'Código de partida inválido (4–6 caracteres alfanuméricos)';
    }
    if (!/^.{3,15}$/.test(form.playerName)) {
      newErrors.playerName = 'Nombre debe tener entre 3 y 15 caracteres';
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

    setLoading(true);
    try {
      const { accessToken, playerId } = await joinGame(form.gameCode.toUpperCase(), form.playerName);
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('playerId', playerId);
      toast.showSuccess('¡Te uniste a la partida!');
      navigate(`/partida/${form.gameCode.toUpperCase()}`);
    } catch (err: unknown) {
      // @ts-expect-error status vienen del mock
      const status = err?.status;
      if (status === 404) {
        toast.showError('Partida no encontrada');
      } else if (status === 409) {
        toast.showError('Nombre de jugador no disponible');
      } else {
        toast.showError('Ha ocurrido un error inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h2 className="text-3xl font-semibold text-center mb-8">Unirse a partida</h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Código de partida */}
        <div className="flex flex-col">
          <label htmlFor="gameCode" className="mb-1 font-medium">
            Código de partida
          </label>
          <input
            id="gameCode"
            name="gameCode"
            type="text"
            value={form.gameCode}
            onChange={handleChange}
            aria-invalid={Boolean(errors.gameCode)}
            className="px-3 py-2 rounded border border-gray-700 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.gameCode && (
            <span role="alert" className="text-red-500 text-sm mt-1">
              {errors.gameCode}
            </span>
          )}
        </div>

        {/* Nombre de jugador */}
        <div className="flex flex-col">
          <label htmlFor="playerName" className="mb-1 font-medium">
            Nombre de jugador
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

        {/* Botón unirme */}
        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="bg-secondary hover:bg-secondary/80 text-white w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {loading && <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full" />}
            Unirme
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JoinGamePage; 