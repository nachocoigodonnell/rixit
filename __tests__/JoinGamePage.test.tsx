/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import JoinGamePage from '../src/pages/JoinGamePage';
import * as api from '../src/api';
import { ToastProvider } from '../src/hooks/useToast';

jest.mock('../src/api');

const renderPage = () =>
  render(
    <BrowserRouter>
      <ToastProvider>
        <JoinGamePage />
      </ToastProvider>
    </BrowserRouter>,
  );

describe('JoinGamePage', () => {
  it('muestra toast de éxito y navega al unirse', async () => {
    // @ts-ignore
    api.joinGame.mockResolvedValue({ accessToken: 'abc', playerId: 'p1' });

    renderPage();
    fireEvent.change(screen.getByLabelText(/código de partida/i), { target: { value: 'ABCD' } });
    fireEvent.change(screen.getByLabelText(/nombre de jugador/i), { target: { value: 'Player' } });
    fireEvent.click(screen.getByRole('button', { name: /unirme/i }));

    await waitFor(() => expect(api.joinGame).toHaveBeenCalled());
    expect(screen.getByRole('alert')).toHaveTextContent(/te uniste a la partida/i);
  });

  it('muestra error 404 cuando la partida no existe', async () => {
    const err = new Error('Partida no encontrada');
    // @ts-ignore
    err.status = 404;
    // @ts-ignore
    api.joinGame.mockRejectedValue(err);

    renderPage();
    fireEvent.change(screen.getByLabelText(/código de partida/i), { target: { value: 'XXXX' } });
    fireEvent.change(screen.getByLabelText(/nombre de jugador/i), { target: { value: 'Player' } });
    fireEvent.click(screen.getByRole('button', { name: /unirme/i }));

    await waitFor(() => screen.getByRole('alert'));
    expect(screen.getByRole('alert')).toHaveTextContent(/Partida no encontrada/i);
  });
}); 