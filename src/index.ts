import http from "http";
import { Server as SocketServer, Socket } from "socket.io";
import IRoom from "./interface/IRoom";
import createCheckers from "./utils/createCheckers";
import userRole from "./enum/userRole";
const MAX_PLAYERS: number = 2;

const httpServer: http.Server = http.createServer();

const io = new SocketServer(httpServer, {
  cors: { origin: "*" },
});

let gameRooms: Array<IRoom> = [];
const userRoles: any = {};

io.on("connection", (socket: Socket) => {
  socket.on("join-room", (room: string) => {
    // Assign users SPECTATOR role
    if (!userRoles[socket.id]) userRoles[socket.id] = userRole.SPECTATOR;

    // Check whether the room already exists or not
    const gameRoom: IRoom | undefined = gameRooms.find(
      (elem) => elem.roomId === room
    );

    // If the game room has not been created yet
    if (!gameRoom) {
      // Create new game room
      const newGameRoom: IRoom = {
        roomId: room,
        players: [socket.id],
        checkers: createCheckers(),
        checkersCount: 0,
      };

      userRoles[socket.id] = userRole.PLAYER1;
      // Add the recently created game room to gameRooms
      gameRooms.push(newGameRoom);
    } else {
      // If the game room already exists
      // If there are less than max allowed players in the room
      if (
        gameRoom.players.length < MAX_PLAYERS &&
        // Make sure same player id is not repeated
        !gameRoom.players.includes(socket.id)
      ) {
        gameRoom.players.push(socket.id);
        userRoles[socket.id] = userRole.PLAYER2;
      }
    }
    socket.join(room);
    console.log(`on connection, active games: ${gameRooms.length}`);
  });

  socket.on("place-checker", (cellId: string) => {
    // Make sure if the user trying to place the checker is NOT a spectator
    if (userRoles[socket.id] && userRoles[socket.id] === userRole.SPECTATOR)
      return;

    console.log(
      `player ${socket.id} wants to place a checker on cell ${cellId}`
    );

    // Find the gameRoom of the player
    const gameRoom: IRoom | undefined = gameRooms.find((elem) =>
      elem.players.includes(socket.id)
    );

    if (!gameRoom) return;

    // Find row and column indices of the cell clicked on
    const [row, column] = [
      parseInt(cellId.split("")[0]),
      parseInt(cellId.split("")[1]),
    ];

    // Find the checker to show
    const checker = gameRoom.checkers[row][column];

    // // Make sure the cell is not disabled
    if (checker.disabled) return;

    // Make Updates
    if (gameRoom.checkersCount % 2 === 0) {
      if (userRoles[socket.id] === userRole.PLAYER1) {
        checker.showX = true;
        checker.disabled = true;
        gameRoom.checkersCount++;
      } else return;
    } else {
      if (userRoles[socket.id] === userRole.PLAYER2) {
        checker.showO = true;
        checker.disabled = true;
        gameRoom.checkersCount++;
      } else return;
    }

    // Send back updated checkers to client
    io.sockets.in(gameRoom.roomId).emit("updated-checkers", {
      checkers: gameRoom.checkers,
      count: gameRoom.checkersCount,
    });
  });

  socket.on("disconnect", () => {
    // If a user disconnects from a gameRoom
    // Find whether the disconnecting user was a player
    const gameRoomIndex: number = gameRooms.findIndex((room) =>
      room.players.includes(socket.id)
    );

    if (gameRoomIndex === -1) return;

    // Remove data of room
    gameRooms[gameRoomIndex]?.players.forEach(
      (player) => delete userRoles[player]
    );
    // Remove the room from gameRooms
    gameRooms = gameRooms.splice(gameRoomIndex, 1);
    console.log(`on dis-connection, active games: ${gameRooms.length}`);
  });
});

const PORT: number = parseInt(process.env.PORT as string) || 3001;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
