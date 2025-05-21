import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface PendingRequest {
  reqId: string;
  clientId: string;
  request: any;
  res: any;
  timeout: NodeJS.Timeout;
}

@WebSocketGateway({
  cors: true,
  namespace: '/live-mock',
})
export class LiveMockGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Only keep UI watch and pending requests
  private uiWatch: Map<string, string> = new Map();
  private pendingRequests: Map<string, PendingRequest> = new Map();

  handleConnection(socket: Socket) {
    // Only allow UI to connect via websocket
    socket.on('register', ({ role }) => {
      if (role === 'ui') {
        socket.emit('registered', { role: 'ui' });
      }
    });
    socket.on('watch', ({ clientId }) => {
      this.uiWatch.set(socket.id, clientId);
    });
    socket.on('override-response', ({ reqId, response }) => {
      const pending = this.pendingRequests.get(reqId);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.res.sendOverride(response);
        this.pendingRequests.delete(reqId);
      }
    });
  }

  handleDisconnect(socket: Socket) {
    // Only need to clean up UI watch
    this.uiWatch.delete(socket.id);
  }

  // Called by middleware
  async interceptRequest(clientId: string, req: any, res: any, defaultResponse: any) {
    // Serialize request for socket.io (avoid circular refs)
    const safeRequest = {
      method: req.method,
      path: req.originalUrl || req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      // Optionally add more fields, but avoid Express/Response objects
    };
    console.log({ clientId, defaultResponse });
    // Find all UIs watching this client
    const uiSockets = Array.from(this.uiWatch.entries())
      .filter(([_, cId]) => cId === clientId)
      .map(([sid]) => sid);
    if (uiSockets.length === 0) return false;
    const reqId = uuidv4();
    // Patch res to allow override
    let sent = false;
    res.sendOverride = (data) => {
      if (!sent) {
        sent = true;
        res.status(data.statusCode || 200);
        if (data.headers) Object.entries(data.headers).forEach(([k, v]) => res.setHeader(k, v));
        res.json(data.body || {});
      }
    };
    // Timeout fallback
    const timeout = setTimeout(() => {
      if (!sent) {
        res.sendOverride(defaultResponse);
        this.pendingRequests.delete(reqId);
      }
    }, 15000);
    this.pendingRequests.set(reqId, { reqId, clientId, request: req, res, timeout });
    // Send to all UIs
    uiSockets.forEach(sid => {
      this.server.to(sid).emit('intercept-request', {
        reqId,
        clientId,
        request: safeRequest,
        defaultResponse,
      });
    });
    return true;
  }
}
