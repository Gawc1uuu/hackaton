import { Socket } from 'socket.io';

type SocketSessionId = string;
type UserId = string;

export type TrackableSocket = Socket & { userId?: UserId };

export class SocketConnectionsPool {
  private static instance: SocketConnectionsPool;

  private connections = new Map<SocketSessionId, TrackableSocket>();
  private userSessions = new Map<UserId, SocketSessionId[]>();

  private constructor() {}

  public static getInstance(): SocketConnectionsPool {
    if (!SocketConnectionsPool.instance) {
      SocketConnectionsPool.instance = new SocketConnectionsPool();
    }
    return SocketConnectionsPool.instance;
  }

  public addConnection(id: SocketSessionId, socket: Socket, userId?: UserId) {
    this.connections.set(id, socket as TrackableSocket);
    if (userId) {
      if (!this.userSessions.has(userId)) {
        this.userSessions.set(userId, []);
      }
      this.userSessions.get(userId)!.push(id);
      // @ts-ignore
      socket['userId'] = userId;
    }
  }

  public assignUserToSocket(userId: UserId, socketId: SocketSessionId) {
    if (!this.connections.has(socketId)) {
      throw new Error('Socket not found');
    }
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, []);
    }
    this.userSessions.get(userId)!.push(socketId);
    // @ts-ignore
    this.connections.get(socketId)['userId'] = userId;
  }

  public getUserBySocketId(id: SocketSessionId): UserId | undefined {
    const socket = this.connections.get(id);
    if (!socket) {
      return undefined;
    }
    return socket.userId;
  }

  // Probably not needed
  public getConnectionBySocketId(id: SocketSessionId): TrackableSocket | undefined {
    return this.connections.get(id);
  }

  public removeConnectionBySocketSessionId(id: SocketSessionId) {
    this.connections.delete(id);
  }

  public getUserConnections(userId: UserId): TrackableSocket[] {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) {
      return [];
    }
    return userSessions.map((sessionId) => this.connections.get(sessionId)!);
  }

  public removeUserConnections(userId: UserId) {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) {
      return;
    }
    for (const sessionId of userSessions) {
      this.connections.delete(sessionId);
    }
    this.userSessions.delete(userId);
  }
}
