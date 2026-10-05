import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;
let socketToken: string | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket && socketToken === token) return socket;
  socket?.disconnect();

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  socketToken = token;

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketToken = null;
  }
};

export const getSocket = (): Socket | null => socket;

export const joinRoom = (roomId: string) => {
  socket?.emit('join_room', roomId);
};

export const sendSocketMessage = (roomId: string, text: string) => {
  socket?.emit('send_message', { roomId, text });
};

export const setTyping = (roomId: string, isTyping: boolean) => {
  socket?.emit('typing', { roomId, isTyping });
};
