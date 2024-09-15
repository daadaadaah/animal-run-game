import http from 'http';

import { Server } from 'socket.io';

import { gameSetting, getCurrentCycle} from './domain';

import { SocketEvents, GameStatus, Animal } from './enums';

const socket = (server: http.Server) => {

  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  });

  io.on(SocketEvents.CONNECTION, socket => {
    console.log('New client connected : '+socket.id);

    socket.on(SocketEvents.DISCONNECTION, () => console.log('user disconnect : ', socket.id));

    const currentDate = new Date();

    socket.emit(SocketEvents.GAMESTATUS, {
      currentCycle: getCurrentCycle(gameSetting.initialGameStartDate, currentDate),
      gameStatus: GameStatus.READY, 
      remainingTimeSecond: 1,
      animals: [
        {
          type: Animal.Rabbit,
          currentPosition: 5,
        },
        {
          type: Animal.Turtle,
          currentPosition: 3,
        },
        {
          type: Animal.Dog,
          currentPosition: 2,
        }
      ]
    });
  });  
};

export default socket;
