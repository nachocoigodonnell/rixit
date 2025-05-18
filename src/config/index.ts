// Archivo central de configuración del frontend

// Puertos y host locales por defecto
const API_PORT = 8899; // Puerto del backend
const API_HOST = 'localhost';

export const config = {
  api: {
    baseUrl: `http://${API_HOST}:${API_PORT}`,
    endpoints: {
      createGame: '/games/create',
      joinGame: (code: string) => `/games/${code}/join`,
      gameByCode: (code: string) => `/games/code/${code}`,
      startGame: (code: string) => `/games/${code}/start`,
      submitClue: (code: string) => `/games/${code}/clue`,
      submitCard: (code: string) => `/games/${code}/submit`,
      voteCard: (code: string) => `/games/${code}/vote`,
      revealRound: (code: string) => `/games/${code}/reveal`,
      leaveGame: (code: string) => `/games/${code}/leave`,
    },
  },
  socket: {
    // Conexión Socket.IO al backend (sin namespace, usamos raíz)
    url: `http://${API_HOST}:${API_PORT}`,
    options: {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    },
  },
};

// Generar la misma configuración para una IP de red local (por ejemplo móvil)
export const getNetworkConfig = (ip: string) => ({
  ...config,
  api: {
    ...config.api,
    baseUrl: `http://${ip}:${API_PORT}`,
  },
  socket: {
    ...config.socket,
    url: `http://${ip}:${API_PORT}`,
  },
}); 