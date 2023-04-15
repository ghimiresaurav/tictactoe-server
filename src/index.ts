import http from "http";
import { Server as SocketServer, Socket } from "socket.io";
import IRoom from "./interface/IRoom";
import createCheckers from "./utils/createCheckers";
import userRole from "./enum/userRole";
import checkGameOver from "./utils/checkGameOver";
import checkerType from "./enum/checkerType";
import gameStatus from "./enum/gameStatus";
const MAX_PLAYERS: number = 2;
const MIN_PLAYERS: number = 2;

const httpServer: http.Server = http.createServer();

const io = new SocketServer(httpServer, {
  cors: { origin: "*" },
});

interface IUser {
  id: string;
  room: string;
  role: string;
}

let gameRooms: Array<IRoom> = [];
const users: any = {};
// const users: Array<IUser> = [];

io.on("connection", (socket: Socket) => {
  socket.on("join-room", (room: string) => {
    // Assign users SPECTATOR role
    if (!users[socket.id]) {
      users[socket.id] = { role: userRole.SPECTATOR, room, id: socket.id };
    }

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
        gameStatus: gameStatus.WAITING,
      };

      users[socket.id] = { role: userRole.PLAYER1, room, id: socket.id };
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
        const player1 = gameRoom.players[0];
        io.to(player1).emit("join-room-ack", {
          message: "Another player has joined the room.",
          gameStatus: gameStatus.PLAYING,
          role: users[player1].role,
        });

        // Add player2's id to the players list
        gameRoom.players.push(socket.id);
        users[socket.id] = { role: userRole.PLAYER2, room, id: socket.id };
        gameRoom.gameStatus = gameStatus.PLAYING;
      }
    }
    socket.join(room);
    socket.emit("join-room-ack", {
      message: `You have joined a room`,
      room,
      role: users[socket.id].role,
      gameStatus: gameRoom?.gameStatus,
    });
  });

  socket.on("place-checker", (cellId: string) => {
    // Make sure if the user trying to place the checker is NOT a spectator
    if (users[socket.id] && users[socket.id].role === userRole.SPECTATOR)
      return;

    // Find the gameRoom of the player
    const gameRoom: IRoom | undefined = gameRooms.find((elem) =>
      elem.players.includes(socket.id)
    );

    if (!gameRoom) return;
    if (gameRoom.players.length < MIN_PLAYERS) return;

    // Find row and column indices of the cell clicked on
    const [row, column] = [
      parseInt(cellId.split("")[0]),
      parseInt(cellId.split("")[1]),
    ];

    // Find the checker to show
    const checker = gameRoom.checkers[row][column];

    // Make sure the cell is not disabled
    if (checker.disabled) {
      return socket.emit("updated-checkers", {
        checkers: gameRoom.checkers,
        count: gameRoom.checkersCount,
      });
    }

    // Make Updates
    if (gameRoom.checkersCount % 2 === 0) {
      if (users[socket.id].role === userRole.PLAYER1) {
        // checker.showX = true;
        checker.type = checkerType.X;
        checker.disabled = true;
        gameRoom.checkersCount++;
      } else return;
    } else {
      if (users[socket.id].role === userRole.PLAYER2) {
        // checker.showO = true;
        checker.type = checkerType.O;
        checker.disabled = true;
        gameRoom.checkersCount++;
      } else return;
    }

    // Check for game over condition
    if (gameRoom.checkersCount > 4) {
      const win: boolean = checkGameOver(gameRoom.checkers, checker);

      // Gameover
      if (win || gameRoom.checkersCount === 9) {
        let gameOverStats = {
          gameStatus: gameStatus.GAME_OVER,
          win,
          winner: "",
        };

        if (win) {
          gameRoom.gameStatus = gameStatus.GAME_OVER;
          gameOverStats.winner =
            checker.type === checkerType.X ? "player1" : "player2";
        }

        io.sockets.in(gameRoom.roomId).emit("game-over", gameOverStats);
      }
    }

    // Send back updated checkers to client
    io.sockets.in(gameRoom.roomId).emit("updated-checkers", {
      checkers: gameRoom.checkers,
      count: gameRoom.checkersCount,
    });
  });

  // Play Again
  socket.on("play-again", (room: string) => {
    // Find the room which requested a new game
    const gameRoom: IRoom | undefined = gameRooms.find(
      (elem) => elem.roomId === room
    );

    if (!gameRoom) return;

    // Reset game data in the gameroom
    gameRoom.checkersCount = 0;
    gameRoom.gameStatus = gameStatus.PLAYING;
    gameRoom.checkers = createCheckers();

    io.sockets.to(gameRoom.roomId).emit("new-game", {
      message: `New game has been commenced.`,
      checkers: gameRoom.checkers,
      count: gameRoom.checkersCount,
      gameStatus: gameRoom.gameStatus,
    });
  });

  socket.on("disconnect", () => {
    // If a user disconnects from a gameRoom
    // Find whether the disconnecting user was a player
    const gameRoomIndex: number = gameRooms.findIndex((room) =>
      room.players.includes(socket.id)
    );

    if (gameRoomIndex === -1) return;

    // Get a list of all users' ids from the room
    const roomId: string = gameRooms[gameRoomIndex].roomId;
    const usersToRemove = Object.values(users).filter(
      (elem: any) => elem.room === roomId
    );
    // Remove users info from the array users
    usersToRemove.forEach((user: any) => {
      delete users[user.id];
    });
    // Remove the room from gameRooms
    gameRooms.splice(gameRoomIndex, 1);
  });
});

const PORT: number = parseInt(process.env.PORT as string) || 3001;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
