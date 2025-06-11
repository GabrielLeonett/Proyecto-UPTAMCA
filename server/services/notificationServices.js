// services/notificationService.js
import { Server, OPEN } from "ws";

class NotificationService {
  constructor() {
    this.pool = new Pool();
    this.wss = new Server({ noServer: true });
    this.pgClient = null;
  }

  async start(server) {
    // Integrar WebSocket con el servidor HTTP existente
    server.on("upgrade", (request, socket, head) => {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit("connection", ws, request);
      });
    });

    // Conectar a PostgreSQL para escuchar notificaciones
    await this.connectToPg();
  }

  async connectToPg() {
    this.pgClient = await this.pool.connect();

    await this.pgClient.query("LISTEN pnf_created");

    this.pgClient.on("notification", (msg) => {
      try {
        const data = JSON.parse(msg.payload);
        this.broadcast("pnf_created", data);
      } catch (err) {
        console.error("Error processing notification:", err);
      }
    });
  }

  broadcast(data) {
    const message = JSON.stringify({ data });

    this.wss.clients.forEach((client) => {
      if (client.readyState === OPEN) {
        client.send(message);
      }
    });
  }
}

export default new NotificationService();
