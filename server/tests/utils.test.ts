import { convertMilliSecondToSecond, convertSecondToMilliSecond } from '../src/utils';

test('convertMilliSecondToSecond', () => {
  expect(convertMilliSecondToSecond(1000)).toBe(1);
  
  expect(convertMilliSecondToSecond(2000)).toBe(2);
  
  expect(convertMilliSecondToSecond(0)).toBe(0);
  
  expect(convertMilliSecondToSecond(500)).toBe(0.5);
});

test('convertSecondToMilliSecond', () => {
  expect(convertSecondToMilliSecond(1)).toBe(1000);

  expect(convertSecondToMilliSecond(2)).toBe(2000);
  
  expect(convertSecondToMilliSecond(0)).toBe(0);

  expect(convertSecondToMilliSecond(0.5)).toBe(500);
});
