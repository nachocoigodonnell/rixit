import { joinGameMock, JoinGameResponse } from './mockServer';

/**
 * Wrapper para la lógica de datos de la aplicación.
 * En producción, sustituir por peticiones reales al backend (fetch / axios).
 */
// TODO: conectar con `/api/` real cuando esté disponible.
export async function joinGame(gameCode: string, playerName: string): Promise<JoinGameResponse> {
  return joinGameMock(gameCode, playerName);
}

export type { JoinGameResponse }; 