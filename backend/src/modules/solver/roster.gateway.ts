// backend/src/modules/solver/roster.gateway.ts
// WebSocket gateway for real-time roster updates

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface RosterUpdateEvent {
  type: 'shift_assigned' | 'shift_unassigned' | 'shift_updated' | 'optimization_complete';
  teamId: string;
  data: any;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/roster',
})
export class RosterGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RosterGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('Roster WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  /**
   * Client joins a team room to receive updates
   */
  @SubscribeMessage('join_team')
  handleJoinTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { teamId: string },
  ) {
    const room = `team:${data.teamId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', data: { room } };
  }

  /**
   * Client leaves a team room
   */
  @SubscribeMessage('leave_team')
  handleLeaveTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { teamId: string },
  ) {
    const room = `team:${data.teamId}`;
    client.leave(room);
    this.logger.debug(`Client ${client.id} left room ${room}`);
    return { event: 'left', data: { room } };
  }

  /**
   * Broadcast shift assignment to team
   */
  emitShiftAssigned(teamId: string, shiftId: string, userId: string) {
    this.emitToTeam(teamId, {
      type: 'shift_assigned',
      teamId,
      data: { shiftId, userId, timestamp: new Date().toISOString() },
    });
  }

  /**
   * Broadcast shift unassignment to team
   */
  emitShiftUnassigned(teamId: string, shiftId: string) {
    this.emitToTeam(teamId, {
      type: 'shift_unassigned',
      teamId,
      data: { shiftId, timestamp: new Date().toISOString() },
    });
  }

  /**
   * Broadcast shift update to team
   */
  emitShiftUpdated(teamId: string, shift: any) {
    this.emitToTeam(teamId, {
      type: 'shift_updated',
      teamId,
      data: { shift, timestamp: new Date().toISOString() },
    });
  }

  /**
   * Broadcast optimization completion to team
   */
  emitOptimizationComplete(
    teamId: string,
    result: { status: string; assignmentsCount: number },
  ) {
    this.emitToTeam(teamId, {
      type: 'optimization_complete',
      teamId,
      data: { ...result, timestamp: new Date().toISOString() },
    });
  }

  /**
   * Send event to all clients in a team room
   */
  private emitToTeam(teamId: string, event: RosterUpdateEvent) {
    const room = `team:${teamId}`;
    this.server.to(room).emit('roster_update', event);
    this.logger.debug(`Emitted ${event.type} to room ${room}`);
  }
}

