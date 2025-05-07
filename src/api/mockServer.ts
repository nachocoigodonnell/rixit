/**
 * Simulación de servidor para la operación de unirse a partida.
 * No depende de librerías externas; puro TypeScript y promesas.
 */

export interface JoinGameResponse {
  accessToken: string;
  playerId: string;
}

/**
 * Simula la llamada al backend para unirse a una partida.
 *
 * @param gameCode - Código de la partida (alfanumérico, 4–6 caracteres).
 * @param playerName - Nombre del jugador (3–15 caracteres).
 * @throws Error con propiedad `status` cuando la partida no existe (404)
 *         o cuando el nombre está ocupado (409).
 */
export async function joinGameMock(
  gameCode: string,
  playerName: string,
): Promise<JoinGameResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 404 – partida no encontrada
      if (gameCode.toUpperCase() === 'XXXX') {
        const err = new Error('Partida no encontrada');
        // @ts-expect-error status dinámico para simular respuesta HTTP
        err.status = 404;
        reject(err);
        return;
      }

      // 409 – nombre ya usado
      if (playerName.toLowerCase() === 'taken') {
        const err = new Error('Nombre de jugador no disponible');
        // @ts-expect-error status dinámico para simular respuesta HTTP
        err.status = 409;
        reject(err);
        return;
      }

      // Éxito
      const accessToken = `token-${Math.random().toString(36).slice(2)}`;
      const playerId = `player-${Math.random().toString(36).slice(2, 10)}`;
      resolve({ accessToken, playerId });
    }, 800);
  });
} 