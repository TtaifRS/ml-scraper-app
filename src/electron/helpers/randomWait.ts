export const randomWait = (min: number, max: number) => (
  new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min) + min)))
)