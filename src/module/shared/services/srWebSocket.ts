import WebSocket from "ws";
import { AppEnv } from "../../../base/loaders/cfgBaseLoader";
import { stdLog } from "../utils/utLog";

class SrWebSocket {
  static instance: SrWebSocket;
  private ws: WebSocket.Server;
  private clients = new Map<string, WebSocket>();

  constructor() {
    this.ws = new WebSocket.Server({ port: AppEnv.webSocket.port });
  }

  public static get(): SrWebSocket {
    if (!SrWebSocket.instance) {
      SrWebSocket.instance = new SrWebSocket();
    }
    return this.instance;
  }

  get getWs(): WebSocket.Server {
    return this.ws;
  }

  broadCastDataToAllClients(data: unknown, type: string): void {
    this.clients.forEach((ws) => {
      ws.send(JSON.stringify({
        type,
        payload: data,
      }));
    });
  }

  broadCastDataToClient(key: string, data: unknown, type: string): void {
    if (this.clients.has(key)) {
      const client = this.clients.get(key);
      if (client) {
        client.send(JSON.stringify({
          type,
          payload: data,
        }));
      }
    }
  }

  setClient(key: string, ws: WebSocket): void {
    this.clients.set(key, ws);
    stdLog("\x1b[33m%s\x1b[0m", `Websockets clients connected: ${this.clients.size}`);
  }

  destroyClientConnection(key: string): void {
    if (this.clients.has(key)) {
      const client = this.clients.get(key);
      if (client) {
        client.close();
        stdLog("\x1b[31m%s\x1b[0m", `The client with key ${key} has been disconnected`);
      }
    }
  }

  close(): void {
    if (this.ws) this.ws.close();
  }
}

export default SrWebSocket;
