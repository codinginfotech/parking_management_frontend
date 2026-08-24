import { Socket, io } from 'socket.io-client';
import { API_BASE_URL } from './api';

export const SOCKET_EVENTS = {
  VEHICLE_ENTERED: 'vehicle:entered',
  VEHICLE_EXITED: 'vehicle:exited',
  OCCUPANCY_UPDATED: 'occupancy:updated',
  PAYMENT_RECEIVED: 'payment:received',
} as const;

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }
  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 15000,
  });
  return socket;
}

/** Keeps the handshake token fresh so reconnects after expiry succeed. */
export function updateSocketToken(token: string): void {
  if (socket) socket.auth = { token };
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
