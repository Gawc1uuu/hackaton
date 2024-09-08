import { Socket } from 'socket.io';

import { SOCKET_IO_EVENTS } from './topics';

import { userRegistrationHandler } from './register';
import { tradingHandler } from './trade';
import { SocketConnectionsPool } from '../../singletons/sockeio/pool';

export async function handleConnectionWithServer(socket: Socket) {
  console.log('A user connected', socket.id);
  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
  });

  SocketConnectionsPool.getInstance().addConnection(socket.id, socket);

  if (socket.handshake.headers['walletAddress'] && typeof socket.handshake.headers['walletAddress'] === 'string') {
    SocketConnectionsPool.getInstance().assignUserToSocket(socket.id, socket.handshake.headers['walletAddress']);
  }

  // Register event handlers
  socket.on(SOCKET_IO_EVENTS.USER_EMITTED.REGISTER, (payload) => userRegistrationHandler(socket, payload));
  socket.on(SOCKET_IO_EVENTS.USER_EMITTED.MAKE_TRADE, (payload) => tradingHandler(socket, payload));
}
