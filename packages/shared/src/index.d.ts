/**
 * @vue-puzzle-vcode/shared
 * Pure, framework-agnostic utilities: math + canvas drawing for the
 * sliding-puzzle captcha. No Vue imports here — safe to bundle anywhere.
 */
/** Random integer in [min, max] (inclusive). */
export declare function randomInt(min: number, max: number): number;
/** Clamp `v` into [min, max]. */
export declare function clamp(v: number, min: number, max: number): number;
/**
 * Normalized puzzle-block edge length.
 * Faithful port of the original `puzzleBaseSize` computed.
 */
export declare function computePuzzleBaseSize(puzzleScale: number): number;
/**
 * Normalized slider size (integer, 10..canvasWidth/2).
 * Faithful port of the original `sliderBaseSize` computed.
 */
export declare function computeSliderBaseSize(sliderSize: number, canvasWidth: number): number;
/**
 * Usable track length (canvasWidth - sliderBaseSize), floored at 1 so the
 * drag-compensation term never divides by zero.
 */
export declare function computeTrackTravel(canvasWidth: number, sliderBaseSize: number): number;
/**
 * Horizontal offset of the floating puzzle piece, kept in sync with the
 * slider. Compensates for puzzle-vs-slider width mismatch across the track.
 */
export declare function computePuzzleTranslateX(styleWidth: number, sliderBaseSize: number, puzzleBaseSize: number, trackTravel: number): number;
/**
 * Absolute pixel deviation used for pass/fail. The trailing `-3` undoes the
 * shadow crop offset applied when the piece was copied off the main canvas.
 */
export declare function computeDragDeviation(pinX: number, styleWidth: number, sliderBaseSize: number, puzzleBaseSize: number, trackTravel: number): number;
/**
 * Source rectangle used to copy the puzzle piece (and its drop shadow) off
 * the main canvas. `sw`/`sh` are WIDTH/HEIGHT for `getImageData`.
 */
export declare function computePuzzleCropRect(pinX: number, pinY: number, puzzleBaseSize: number): {
    sx: number;
    sy: number;
    sw: number;
    sh: number;
};
/**
 * object-fit: cover mapping of an image onto a canvas.
 * Returns [x, y, width, height] for drawImage.
 */
export declare function coverSize(imgWidth: number, imgHeight: number, canvasWidth: number, canvasHeight: number): [number, number, number, number];
/**
 * Trace the jigsaw piece path at (pinX, pinY) on `ctx`.
 * The path is not filled/stroked — callers decide (fill, clip, shadow…).
 * Faithful port of the original `paintBrick`.
 */
export declare function tracePuzzlePath(ctx: CanvasRenderingContext2D, pinX: number, pinY: number, puzzleScale: number): void;
/** Generate a random abstract background image as a data URL. */
export declare function generateRandomImage(canvasWidth: number, canvasHeight: number): string;
/** Load an image (CORS-anonymous) as a promise. */
export declare function loadImage(src: string): Promise<HTMLImageElement>;
export interface PuzzleCanvases {
    /** Main canvas: background with the puzzle-shaped hole. */
    main: HTMLCanvasElement;
    /** Small floating puzzle piece canvas. */
    puzzle: HTMLCanvasElement;
    /** Full picture canvas revealed on success. */
    success: HTMLCanvasElement;
}
export interface DrawPuzzleFrameOptions {
    canvasWidth: number;
    canvasHeight: number;
    /** Raw user scale prop (0.2..2). */
    puzzleScale: number;
    /** Normalized puzzle block size, see {@link computePuzzleBaseSize}. */
    puzzleBaseSize: number;
    /** Puzzle piece anchor point. */
    pinX: number;
    pinY: number;
}
/**
 * Draw one full puzzle frame onto the three canvases.
 * Faithful port of the original `init()` onload drawing routine,
 * including the Windows-Firefox shadow workaround.
 */
export declare function drawPuzzleFrame(canvases: PuzzleCanvases, img: HTMLImageElement, opts: DrawPuzzleFrameOptions): void;
/**
 * Inline refresh icon (40x40 PNG) so the component package has zero asset
 * pipeline requirements.
 */
export declare const RESET_ICON: string;
