import { gameSetting, getCurrentCycle } from '../src/domain'; 

import { convertMilliSecondToSecond, convertSecondToMilliSecond } from '../src/utils';

describe('getCurrentCycle', () => {
  const startDate = gameSetting.initialGameStartDate;

  const TOTAL_CYCLE_TIME_MILLIL_SECOND = gameSetting.getTotalCycleTimeMilliSecond();
  
  const TOTAL_CYCLE_TIME_SECOND = convertMilliSecondToSecond(TOTAL_CYCLE_TIME_MILLIL_SECOND);
  
  it('시작 기준일로부터 0 ~ 19초 후면, 1번째 사이클이 진행중이다.', () => {
    const randomSecond = Math.floor(Math.random() * TOTAL_CYCLE_TIME_SECOND); // 0~19 사이의 랜덤 값 생성

    const endDate = new Date(startDate.getTime() + convertSecondToMilliSecond(randomSecond));

    const cycle = getCurrentCycle(startDate, endDate);

    expect(cycle).toBe(1);
  });

  it('시작 기준일로부터 20초 후면, 2번째 사이클이 시작된다.', () => {
    const endDate = new Date(startDate.getTime() + TOTAL_CYCLE_TIME_MILLIL_SECOND); // 현재 시간에 초 추가

    const cycle = getCurrentCycle(startDate, endDate);

    expect(cycle).toBe(2);
  });

  it('시작 기준일로부터 20~39초 후면, 2번째 사이클이 진행중다.', () => {
    const randomSecond = Math.floor(Math.random() * TOTAL_CYCLE_TIME_SECOND); // 0~19 사이의 랜덤 값 생성

    const endDate = new Date(startDate.getTime() + TOTAL_CYCLE_TIME_MILLIL_SECOND + convertSecondToMilliSecond(randomSecond)); // 현재 시간에 초 추가

    const cycle = getCurrentCycle(startDate, endDate);

    expect(cycle).toBe(2);
  });

  it('시작 기준일로부터 2분(=120초) 후면, 7번째 사이클이 진행중다.', () => {
    const endDate = new Date('2024-09-01T00:02:00Z');

    const cycle = getCurrentCycle(startDate, endDate);

    expect(cycle).toBe(7);
  });
});
