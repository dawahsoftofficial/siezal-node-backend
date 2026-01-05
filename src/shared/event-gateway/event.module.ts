// src/websocket/websocket.module.ts
import { Module } from "@nestjs/common";
import { EventsGateway } from "./event.gateway";

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway], // export for use in other modules
})
export class EventModule {}
