import http from 'http';

import { Server } from 'socket.io';

import { SocketEvents } from './enums';

const socket = (server: http.Server) => {

  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  });

  io.on(SocketEvents.CONNECTION, socket => {
    console.log('New client connected : '+socket.id);

    socket.on(SocketEvents.DISCONNECTION, () => console.log('user disconnect : ', socket.id));

    socket.emit('hello world', '테스트');
  });  
};

export default socket;
