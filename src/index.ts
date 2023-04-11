import http from "http";
import { Server as SocketServer, Socket } from "socket.io";

const httpServer: http.Server = http.createServer();

const io = new SocketServer(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket: Socket) => {
  console.log(`new connection ${socket.id}`);
});

const PORT: number = parseInt(process.env.PORT as string) || 3001;
httpServer.listen(PORT, () => `Server started on port ${PORT}`);
