export const add = (...nums: number[]) => {
  return nums.reduce((r, n) => r + n, 0)
}

export const withSign = (num: number): string => `${num >= 0 ? '+' : ''}${num}`
