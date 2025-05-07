import React from 'react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center space-y-4 py-10">
      <h2 className="text-2xl font-semibold">Crear partida</h2>
      <p className="text-gray-400">Funcionalidad en desarrollo…</p>
      <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => navigate('/')}>Volver</Button>
    </div>
  );
};

export default CreateGamePage; 