export const getRandomNumber = (from: number, to: number) => {
  return from + (crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) * (to - from)
}

export const getRandomNumberFixed = (from: number, to: number, fixed: number) => {
  const randomNumber = from + (crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) * (to - from)
  const fixedNumber = +randomNumber.toFixed(fixed)
  return fixedNumber
}
