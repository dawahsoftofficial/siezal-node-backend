// src/websocket/events.gateway.ts
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

export type SocketEvent = "newOrder" | string;

@WebSocketGateway({ cors: true })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // Emit an event to all connected clients
  emitEvent(event: SocketEvent, data: any) {
    this.server.emit(event, data);
  }

  // Optional: emit to a specific room (for private events)
  emitToRoom(room: string, event: SocketEvent, data: any) {
    this.server.to(room).emit(event, data);
  }
}
