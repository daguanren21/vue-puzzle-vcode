import { describe, expect, it } from 'vitest'
import {
  clamp,
  computeDragDeviation,
  computePuzzleBaseSize,
  computePuzzleCropRect,
  computePuzzleTranslateX,
  computeSliderBaseSize,
  computeTrackTravel,
  coverSize,
  randomInt,
} from '../src/index'

describe('clamp / sizes', () => {
  it('clamp bounds values', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
  })

  it('computePuzzleBaseSize clamps scale to 0.2..2', () => {
    expect(computePuzzleBaseSize(1)).toBe(Math.round(1 * 52.5 + 6))
    expect(computePuzzleBaseSize(0)).toBe(Math.round(0.2 * 52.5 + 6))
    expect(computePuzzleBaseSize(9)).toBe(Math.round(2 * 52.5 + 6))
  })

  it('computeSliderBaseSize stays within [10, canvasWidth/2]', () => {
    expect(computeSliderBaseSize(50, 310)).toBe(50)
    expect(computeSliderBaseSize(1, 310)).toBe(10)
    expect(computeSliderBaseSize(400, 310)).toBe(Math.round(310 * 0.5))
  })
})

describe('track / deviation', () => {
  it('computeTrackTravel never returns 0', () => {
    expect(computeTrackTravel(310, 50)).toBe(260)
    expect(computeTrackTravel(50, 50)).toBe(1)
    expect(computeTrackTravel(40, 50)).toBe(1)
  })

  it('perfect alignment yields finite deviation under range after shadow offset', () => {
    // pinX=100, dragged should land at pinX-3 for perfect match (shadow crop).
    const slider = 50
    const puzzle = 58
    const travel = 260
    const styleWidth = slider + (100 - 3) // dragged = 97
    const x = computeDragDeviation(100, styleWidth, slider, puzzle, travel)
    // residual is the width-gap compensation term only when puzzle != slider
    const expected = Math.abs(100 - 97 + (puzzle - slider) * (97 / travel) - 3)
    expect(x).toBe(expected)
    expect(x).toBeLessThan(10)
  })

  it('puzzle translate matches drag compensation formula', () => {
    const styleWidth = 150
    const slider = 50
    const puzzle = 58
    const travel = 260
    const dragged = styleWidth - slider
    expect(computePuzzleTranslateX(styleWidth, slider, puzzle, travel)).toBe(
      dragged - (puzzle - slider) * (dragged / travel),
    )
  })

  it('does not produce NaN when travel is floored to 1', () => {
    expect(Number.isFinite(computeDragDeviation(20, 50, 50, 58, 1))).toBe(true)
    expect(Number.isFinite(computePuzzleTranslateX(50, 50, 58, 1))).toBe(true)
  })
})

describe('puzzle crop rect', () => {
  it('returns width/height, not end coordinates', () => {
    const puzzleBaseSize = 58
    const pinX = 232
    const pinY = 40
    const { sx, sy, sw, sh } = computePuzzleCropRect(pinX, pinY, puzzleBaseSize)
    expect(sx).toBe(229)
    expect(sy).toBe(20)
    expect(sw).toBe(66) // puzzleBaseSize + 8
    expect(sh).toBe(83) // puzzleBaseSize + 25
    // must stay inside a 310x160 canvas for the worst-case pinX
    expect(sx + sw).toBeLessThanOrEqual(310)
    expect(sy + sh).toBeLessThanOrEqual(160)
  })
})

describe('coverSize', () => {
  it('covers landscape image onto canvas', () => {
    const [x, y, w, h] = coverSize(800, 200, 310, 160)
    expect(h).toBe(160)
    expect(w).toBeGreaterThan(310)
    expect(x).toBeLessThan(0)
    expect(y).toBe(0)
  })

  it('covers portrait image onto canvas', () => {
    const [x, y, w, h] = coverSize(200, 800, 310, 160)
    expect(w).toBe(310)
    expect(h).toBeGreaterThan(160)
    expect(x).toBe(0)
    expect(y).toBeLessThan(0)
  })
})

describe('randomInt', () => {
  it('stays within inclusive bounds', () => {
    for (let i = 0; i < 200; i++) {
      const n = randomInt(2, 5)
      expect(n).toBeGreaterThanOrEqual(2)
      expect(n).toBeLessThanOrEqual(5)
    }
  })

  it('handles inverted range', () => {
    expect(randomInt(5, 2)).toBe(5)
  })
})
