import http from 'http';

import { Server } from 'socket.io';

import * as fs from 'fs';

import * as XLSX from 'xlsx';

import { gameSetting, getCurrentCycle} from './domain';

import { SocketEvents, GameStatus, Animal } from './enums';

import { convertMilliSecondToSecond } from './utils';

interface GameResult {
  n: number;
  first: Animal;
  second: Animal;
  third: Animal;
}

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

        // TODO : 게임 결과 파일에 저장하도록 일단 임시 데이터로 저장
        const tempGameResult: GameResult = {
          n: cycleCnt,
          first: Animal.Rabbit,
          second: Animal.Turtle,
          third: Animal.Dog,
        };

        saveGameResultToExcel(tempGameResult);

        startCycle();
      }
    }, gameRenderringTimeIntervalMs);
  }

  // 0. 초기 설정일부터 현재 사이클 이전의 히스토리 파일 만들기  : 랜덤하게 5/2/3의 승률을 가진 
  const currentDate = new Date();

  const cycleCnt = getCurrentCycle(gameSetting.initialGameStartDate, currentDate) - 1;

  console.log(generateArrayWithPercentages(cycleCnt)); // 일단 임시로 콘솔에!
  
  // 1. 처음 게임 시작
  startCycle(); // 사이클을 무한 반복 시작
};

 
function generateArrayWithPercentages(n: number): number[][] {
  const arr = [0, 1, 2];

  const result = [];
  
  for (let i = 0; i < n; i++) {
    const randomStart = Math.floor(Math.random() * n) + 1;

    const percentagesArray = shuffleArray(arr);
    result.push([randomStart, ...percentagesArray]);
  }

  return result;
}

function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at index i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 게임 결과를 액셀에 저장하는 함수
function saveGameResultToExcel(gameResult: GameResult) {
  const filePath = './game_results.xlsx';

  let workbook: XLSX.WorkBook;
  let worksheet: XLSX.WorkSheet;

  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath);
    worksheet = workbook.Sheets['Results'];
  } else {

    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
  }

  const existingData = XLSX.utils.sheet_to_json(worksheet);

  existingData.push(gameResult);

  const updatedWorksheet = XLSX.utils.json_to_sheet(existingData);

  workbook.Sheets['Results'] = updatedWorksheet;

  XLSX.writeFile(workbook, filePath);
}

export default socket;
