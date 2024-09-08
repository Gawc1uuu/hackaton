import { Server as SocketIoServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export let socketIoServer: SocketIoServer;

export function initSocketIoServer(httpServer: HttpServer) {
  socketIoServer = new SocketIoServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });
}
