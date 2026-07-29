/**
 * @vue-puzzle-vcode/shared
 * Pure, framework-agnostic utilities: math + canvas drawing for the
 * sliding-puzzle captcha. No Vue imports here — safe to bundle anywhere.
 */

/** Random integer in [min, max]. */
export function randomInt(min: number, max: number): number {
  return Math.ceil(Math.random() * (max - min) + min)
}

/** Clamp `v` into [min, max]. */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

/**
 * Normalized puzzle-block edge length.
 * Faithful port of the original `puzzleBaseSize` computed.
 */
export function computePuzzleBaseSize(puzzleScale: number): number {
  return Math.round(clamp(puzzleScale, 0.2, 2) * 52.5 + 6)
}

/**
 * Normalized slider size (integer, 10..canvasWidth/2).
 * Faithful port of the original `sliderBaseSize` computed.
 */
export function computeSliderBaseSize(sliderSize: number, canvasWidth: number): number {
  return Math.max(Math.min(Math.round(sliderSize), Math.round(canvasWidth * 0.5)), 10)
}

/**
 * object-fit: cover mapping of an image onto a canvas.
 * Returns [x, y, width, height] for drawImage.
 */
export function coverSize(
  imgWidth: number,
  imgHeight: number,
  canvasWidth: number,
  canvasHeight: number,
): [number, number, number, number] {
  const imgScale = imgWidth / imgHeight
  const canvasScale = canvasWidth / canvasHeight
  if (imgScale > canvasScale) {
    const h = canvasHeight
    const w = imgScale * h
    return [(canvasWidth - w) / 2, 0, w, h]
  }
  const w = canvasWidth
  const h = w / imgScale
  return [0, (canvasHeight - h) / 2, w, h]
}

/**
 * Trace the jigsaw piece path at (pinX, pinY) on `ctx`.
 * The path is not filled/stroked — callers decide (fill, clip, shadow…).
 * Faithful port of the original `paintBrick`.
 */
export function tracePuzzlePath(
  ctx: CanvasRenderingContext2D,
  pinX: number,
  pinY: number,
  puzzleScale: number,
): void {
  const moveL = Math.ceil(15 * puzzleScale) // base straight-line distance
  ctx.beginPath()
  ctx.moveTo(pinX, pinY)
  ctx.lineTo(pinX + moveL, pinY)
  ctx.arcTo(pinX + moveL, pinY - moveL / 2, pinX + moveL + moveL / 2, pinY - moveL / 2, moveL / 2)
  ctx.arcTo(pinX + moveL + moveL, pinY - moveL / 2, pinX + moveL + moveL, pinY, moveL / 2)
  ctx.lineTo(pinX + moveL + moveL + moveL, pinY)
  ctx.lineTo(pinX + moveL + moveL + moveL, pinY + moveL)
  ctx.arcTo(
    pinX + moveL + moveL + moveL + moveL / 2,
    pinY + moveL,
    pinX + moveL + moveL + moveL + moveL / 2,
    pinY + moveL + moveL / 2,
    moveL / 2,
  )
  ctx.arcTo(
    pinX + moveL + moveL + moveL + moveL / 2,
    pinY + moveL + moveL,
    pinX + moveL + moveL + moveL,
    pinY + moveL + moveL,
    moveL / 2,
  )
  ctx.lineTo(pinX + moveL + moveL + moveL, pinY + moveL + moveL + moveL)
  ctx.lineTo(pinX, pinY + moveL + moveL + moveL)
  ctx.lineTo(pinX, pinY + moveL + moveL)
  ctx.arcTo(pinX + moveL / 2, pinY + moveL + moveL, pinX + moveL / 2, pinY + moveL + moveL / 2, moveL / 2)
  ctx.arcTo(pinX + moveL / 2, pinY + moveL, pinX, pinY + moveL, moveL / 2)
  ctx.lineTo(pinX, pinY)
}

/** Generate a random abstract background image as a data URL. */
export function generateRandomImage(canvasWidth: number, canvasHeight: number): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  ctx.fillStyle = `rgb(${randomInt(100, 255)},${randomInt(100, 255)},${randomInt(100, 255)})`
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  // 12 random shapes
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = `rgb(${randomInt(100, 255)},${randomInt(100, 255)},${randomInt(100, 255)})`
    ctx.strokeStyle = `rgb(${randomInt(100, 255)},${randomInt(100, 255)},${randomInt(100, 255)})`
    if (randomInt(0, 2) > 1) {
      // rectangle
      ctx.save()
      ctx.rotate((randomInt(-90, 90) * Math.PI) / 180)
      ctx.fillRect(
        randomInt(-20, canvas.width - 20),
        randomInt(-20, canvas.height - 20),
        randomInt(10, canvas.width / 2 + 10),
        randomInt(10, canvas.height / 2 + 10),
      )
      ctx.restore()
    } else {
      // circle
      ctx.beginPath()
      const ran = randomInt(-Math.PI, Math.PI)
      ctx.arc(
        randomInt(0, canvas.width),
        randomInt(0, canvas.height),
        randomInt(10, canvas.height / 2 + 10),
        ran,
        ran + Math.PI * 1.5,
      )
      ctx.closePath()
      ctx.fill()
    }
  }
  return canvas.toDataURL('image/png')
}

/** Load an image (CORS-anonymous) as a promise. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`[vue-puzzle-vcode] failed to load image: ${src.slice(0, 64)}`))
    img.src = src
  })
}

export interface PuzzleCanvases {
  /** Main canvas: background with the puzzle-shaped hole. */
  main: HTMLCanvasElement
  /** Small floating puzzle piece canvas. */
  puzzle: HTMLCanvasElement
  /** Full picture canvas revealed on success. */
  success: HTMLCanvasElement
}

export interface DrawPuzzleFrameOptions {
  canvasWidth: number
  canvasHeight: number
  /** Raw user scale prop (0.2..2). */
  puzzleScale: number
  /** Normalized puzzle block size, see {@link computePuzzleBaseSize}. */
  puzzleBaseSize: number
  /** Puzzle piece anchor point. */
  pinX: number
  pinY: number
}

/**
 * Draw one full puzzle frame onto the three canvases.
 * Faithful port of the original `init()` onload drawing routine,
 * including the Windows-Firefox shadow workaround.
 */
export function drawPuzzleFrame(
  canvases: PuzzleCanvases,
  img: HTMLImageElement,
  opts: DrawPuzzleFrameOptions,
): void {
  const { canvasWidth, canvasHeight, puzzleScale, puzzleBaseSize, pinX, pinY } = opts
  const ctx = canvases.main.getContext('2d')!
  const ctx2 = canvases.puzzle.getContext('2d')!
  const ctx3 = canvases.success.getContext('2d')!
  const isWindowsFirefox =
    navigator.userAgent.indexOf('Firefox') >= 0 && navigator.userAgent.indexOf('Windows') >= 0

  ctx.fillStyle = 'rgba(255,255,255,1)'
  ctx3.fillStyle = 'rgba(255,255,255,1)'
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx2.clearRect(0, 0, canvasWidth, canvasHeight)

  const [x, y, w, h] = coverSize(img.width, img.height, canvasWidth, canvasHeight)

  // 1. Puzzle piece with drop shadow, clipped to its shape
  ctx.save()
  tracePuzzlePath(ctx, pinX, pinY, puzzleScale)
  ctx.closePath()
  if (!isWindowsFirefox) {
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowColor = '#000'
    ctx.shadowBlur = 3
    ctx.fill()
    ctx.clip()
  } else {
    ctx.clip()
    ctx.save()
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowColor = '#000'
    ctx.shadowBlur = 3
    ctx.fill()
    ctx.restore()
  }

  ctx.drawImage(img, x, y, w, h)
  ctx3.fillRect(0, 0, canvasWidth, canvasHeight)
  ctx3.drawImage(img, x, y, w, h)

  // 2. Inner glow of the piece
  ctx.globalCompositeOperation = 'source-atop'
  tracePuzzlePath(ctx, pinX, pinY, puzzleScale)
  ctx.arc(
    pinX + Math.ceil(puzzleBaseSize / 2),
    pinY + Math.ceil(puzzleBaseSize / 2),
    puzzleBaseSize * 1.2,
    0,
    Math.PI * 2,
    true,
  )
  ctx.closePath()
  ctx.shadowColor = 'rgba(255, 255, 255, .8)'
  ctx.shadowOffsetX = -1
  ctx.shadowOffsetY = -1
  ctx.shadowBlur = Math.min(Math.ceil(8 * puzzleScale), 12)
  ctx.fillStyle = '#ffffaa'
  ctx.fill()

  // 3. Copy the piece onto the small canvas
  //    (-3px horizontal offset accounts for the shadow; validation adds 3 back)
  const imgData = ctx.getImageData(pinX - 3, pinY - 20, pinX + puzzleBaseSize + 5, pinY + puzzleBaseSize + 5)
  ctx2.putImageData(imgData, 0, pinY - 20)

  // 4. Reset main canvas and draw the hole
  ctx.restore()
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  ctx.save()
  tracePuzzlePath(ctx, pinX, pinY, puzzleScale)
  ctx.globalAlpha = 0.8
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.restore()

  // 5. Inner shadow of the hole
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  tracePuzzlePath(ctx, pinX, pinY, puzzleScale)
  ctx.arc(
    pinX + Math.ceil(puzzleBaseSize / 2),
    pinY + Math.ceil(puzzleBaseSize / 2),
    puzzleBaseSize * 1.2,
    0,
    Math.PI * 2,
    true,
  )
  ctx.shadowColor = '#000'
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.shadowBlur = 16
  ctx.fill()
  ctx.restore()

  // 6. Background image behind everything
  ctx.save()
  ctx.globalCompositeOperation = 'destination-over'
  ctx.drawImage(img, x, y, w, h)
  ctx.restore()
}

/**
 * Inline refresh icon (40x40 PNG) so the component package has zero asset
 * pipeline requirements.
 */
export const RESET_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAELklEQVRYR+2YW2wUZRTH//9vtlCo\n' +
  'F9IoIklT3PqgPGi326hoetuaGEhIr9SgCYkkgt2WGOQVCca+GavWdr0GjD4YhG3RB3hply1LQA1t\n' +
  'EQIxEXapGI2pEkys9LIzx2ylYWfY6e5sF0oi+7hzzvl+3/9855xvhrjNf7zN+XAHcL4Z+n8o6JWT\n' +
  'eYt++W25S596AIZy6TB+n3yo+Nchlk8vmIIVowdXU9c3Q1gDSilBlQwjgBAYFGDvdF58/4milqvZ\n' +
  'wDpOcXWsb5Uh8hmBqkwXFMhlCN8aX5LXNbRy/T+Z+iXsHAFWRXs3QGQPyLucLDJrK5DgUXdTsxPf\n' +
  'jAEro8E3Ce50EtxsKxPTwCPH3U2jTmJkBJgWTnAMxDeGMEoa0xQ+LJQnCD4HYFkCyAC3RdwN3U7g\n' +
  'MkpxRTTYrMD91sCJIgCxV5R6O1Jcfy7VwonqLoj9/CqB2kF341qncGkBvRe+ureAWpRgoalCBecM\n' +
  'FzcdK24YymZRJz5zprgq1tsJwXYL3CVZGvdGHmwZc7JQtra2gE+f712ep2QUYP714DJhaJrXLqXZ\n' +
  'QszlZwtYdSHoB9ljVk/ePVrSZFL0ZkAlxzQBVseCT8WhZhRThtFB8plk9Zi/qCi8cv0fNxvKFrDy\n' +
  '4oF11NXXIFy2EII4iBcG3Y03VLZT8OqRd5aFPduvOEpxRayvXolxAKB2g6NgEhobBlc1HHYKY7Wv\n' +
  'Hf5wtVAPgegIlbbZ9seUZ7AyFnwewi9pGoUyDmhrB931kfnC1ZwOeKlLP8GZJi6QLSFP2yep4toX\n' +
  'SbT3ZQAfX3O6omt8Nhd9r/aHQAUMOQywYBZo5uZD2ThQ2rbPCjlnH6yI9rUryE5DU75ctJaake46\n' +
  'Be4DuDjF8dFBNA94/AdtiySVxIlpMlTS8td801o70vMigM9huTda2lhcKHVHPO2HZv/P6LIwX7hk\n' +
  '/+qzPSvUJGMkrg8AQYTkroRdXMlE+HH/twsG6BsOdJHYZlaO/lBZ6weOiiSXqs3Gqj0TeAxx+T75\n' +
  'DIpgwjC0onD51pQD4JaluPrkR/cpFT9DcoVp84LOgTL/DjtBbglgou+puHwB8lEznPxJw1XSX77V\n' +
  'tgizBvQNBw4RMqB7xt4Lc3c8lQKJaQHoO4R8ydz0/7MWoCXk8c85MrMC9J3qaafw/WtQlwXST+F3\n' +
  'BnAeYB4obgJ1BJIuG+YtiKAjVOZ/Pd1ZdwzoG+4uBtSPpjaRbhXLcwF3hzytb2TilgVgT5BkYybB\n' +
  'rTYC+Rvg5nRpdTRJrIs8+VPXPQXj2i4ItxC4O2NQQUQnN4U9rRcz9nH64p4ceM2lziX5Y4s3KHCd\n' +
  'UHwE77ecMkMEp6BwhIa2Z6DslZRvfulgHafYLuCas58WLp2aLCFUga70qxOFU6dPFL2W1feYeaU4\n' +
  '3Y5z/TxnCuYabMEuC043ckdBp4pZ7f8FE5psOI1g6fwAAAAASUVORK5CYII='
