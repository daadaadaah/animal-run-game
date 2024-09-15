import http from 'http';

import { Server } from 'socket.io';

import { gameSetting, getCurrentCycle} from './domain';

import { SocketEvents, GameStatus, Animal } from './enums';

import { convertMilliSecondToSecond } from './utils';

const socket = (server: http.Server) => {

  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  });

  io.on(SocketEvents.CONNECTION, socket => {
    console.log('New client connected : '+socket.id);

    socket.on(SocketEvents.DISCONNECTION, () => console.log('user disconnect : ', socket.id));
  });
  
  // 총 20초의 사이틀(10초 준비 및 10초 실행)을 반복하는 함수
  function startCycle() {
    let readyTimeMs = gameSetting.totalReadyTimeMilliSecond;
  
    const currentDate = new Date();
    const cycleCnt = getCurrentCycle(gameSetting.initialGameStartDate, currentDate);
  
    const readyInterval = setInterval(() => {
      if (readyTimeMs > 0) {
        io.emit(SocketEvents.GAMESTATUS, {
          currentCycle: cycleCnt,
          gameStatus: GameStatus.READY,
          remainingTimeSecond: convertMilliSecondToSecond(readyTimeMs),
          animals: [
            {
              type: Animal.Rabbit,
              currentPosition: 0,
            },
            {
              type: Animal.Turtle,
              currentPosition: 0,
            },
            {
              type: Animal.Dog,
              currentPosition: 0,
            }
          ]
        });
  
      } else {
        clearInterval(readyInterval);
  
        startGame(cycleCnt, gameSetting.totalGameTimeMilliSecond, gameSetting.gameRenderringTimeIntervalMillisecond);
      }
  
      readyTimeMs -= gameSetting.readyTimeRenderringIntervalMilliSecond;
  
    }, gameSetting.readyTimeRenderringIntervalMilliSecond);
  }

  // 실제 게임 중에 100ms 씩 클라이언트한테 보내주는 함수
  function startGame(cycleCnt: number, gameTimeMs: number, gameRenderringTimeIntervalMs: number) {

    const gameIntervalId = setInterval(() => {
      if (gameTimeMs > 0) {
        // TODO : 각 동물별로 포지션 계산 필요
        const randomNum = Math.floor(Math.random() * 100) + 1; 

        const animalPositions = [ // TODO : 실제 비즈니스 로직 추가 필요
          randomNum * 5, // 토끼
          randomNum * 3, // 거북이
          randomNum * 2 // 강아지
        ];
 
        io.emit(SocketEvents.GAMESTATUS, {
          currentCycle: cycleCnt,
          gameStatus: GameStatus.INPROGRESS, 
          remainingTimeSecond: Math.floor(convertMilliSecondToSecond(gameTimeMs+1000)),
          animals: [
            {
              type: Animal.Rabbit,
              currentPosition: animalPositions[0], 
            },
            {
              type: Animal.Turtle,
              currentPosition: animalPositions[1],
            },
            {
              type: Animal.Dog,
              currentPosition: animalPositions[2],
            }
          ]
        })

        gameTimeMs -= gameRenderringTimeIntervalMs; // 100ms마다 0.1초 감소
      } else {
        // 게임 시간이 끝났을 때
        clearInterval(gameIntervalId);

        io.emit(SocketEvents.GAMESTATUS, {
          currentCycle: cycleCnt,
          gameStatus: GameStatus.FINISH, 
          remainingTimeSecond: 0,
          animals: [
            {
              type: Animal.Rabbit,
              currentPosition: 0,
            },
            {
              type: Animal.Turtle,
              currentPosition: 0,
            },
            {
              type: Animal.Dog,
              currentPosition: 0,
            }
          ]
        });

        // TODO : 게임 결과 파일에 저장하도록

        startCycle();
      }
    }, gameRenderringTimeIntervalMs);
  }

  // 0. 초기 설정일부터 현재 사이클 이전의 히스토리 파일 만들기  : 랜덤하게 5/2/3의 승률을 가진 
  
  // 1. 처음 게임 시작
  startCycle(); // 사이클을 무한 반복 시작
};

export default socket;
