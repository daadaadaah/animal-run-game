export const gameSetting = {
  totalReadyTimeMilliSecond: 10000,
  totalGameTimeMilliSecond: 10000,
  readyTimeRenderringIntervalMilliSecond: 1000, // 게임 준비 시간 인터벌 (1000ms)
  gameRenderringTimeIntervalMillisecond: 100, // 게임 실행 시간 동안의 인터벌 (100ms)
  getTotalCycleTimeMilliSecond(): number {
    return this.totalReadyTimeMilliSecond + this.totalGameTimeMilliSecond;
  },
  initialGameStartDate: new Date('2024-09-01T00:00:00Z'),
}

// TODO : 게임에서 startDate 고정이므로, currying 고려해보자. 
export const getCurrentCycle  = (startDate: Date, endDate: Date): number => { 
  const TOTAL_CYCLE_TIME_MILLI_SECOND = gameSetting.totalReadyTimeMilliSecond + gameSetting.totalGameTimeMilliSecond;

  const timeElapsedMs = endDate.getTime() - startDate.getTime();

  return Math.floor(timeElapsedMs / TOTAL_CYCLE_TIME_MILLI_SECOND) + 1;
}
