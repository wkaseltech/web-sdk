import _ from 'lodash';

import type { RawSymbol, SymbolState } from './types';

export const SYMBOL_SIZE = 80;

export const REEL_PADDING = 0.53;

// initial board: 6 reels (columns) x 8 symbols each (6 visible + 1 padding top + 1 padding bottom)
// Grid: 6 wide x 6 tall
// Symbols: H1(Elder) H2(Countess) H3(Knight) H4(Feral) L1(Jack) L2(Queen) L3(King) L4(Ace) SC(Coffin) PT(Chalice)
export const INITIAL_BOARD: RawSymbol[][] = [
	[{ name: 'L1' }, { name: 'H1' }, { name: 'L2' }, { name: 'L3' }, { name: 'H4' }, { name: 'H3' }, { name: 'L4' }, { name: 'H2' }],
	[{ name: 'L2' }, { name: 'L3' }, { name: 'H2' }, { name: 'H4' }, { name: 'L2' }, { name: 'H1' }, { name: 'L3' }, { name: 'L1' }],
	[{ name: 'L3' }, { name: 'H3' }, { name: 'L1' }, { name: 'H4' }, { name: 'H1' }, { name: 'L2' }, { name: 'H2' }, { name: 'L4' }],
	[{ name: 'H4' }, { name: 'L1' }, { name: 'H2' }, { name: 'H3' }, { name: 'L4' }, { name: 'L3' }, { name: 'L1' }, { name: 'H1' }],
	[{ name: 'H2' }, { name: 'H3' }, { name: 'L4' }, { name: 'H1' }, { name: 'L1' }, { name: 'H4' }, { name: 'L3' }, { name: 'L2' }],
	[{ name: 'L4' }, { name: 'L2' }, { name: 'H4' }, { name: 'L1' }, { name: 'H3' }, { name: 'H2' }, { name: 'L4' }, { name: 'H1' }],
];

// BOARD_DIMENSIONS: x = numReels(6), y = visible rows (8 - 2 padding = 6)
export const BOARD_DIMENSIONS = { x: INITIAL_BOARD.length, y: INITIAL_BOARD[0].length - 2 };

export const BOARD_SIZES = {
	width: SYMBOL_SIZE * BOARD_DIMENSIONS.x,
	height: SYMBOL_SIZE * BOARD_DIMENSIONS.y,
};

export const BACKGROUND_RATIO = 1536 / 1024;
export const PORTRAIT_BACKGROUND_RATIO = 1242 / 2208;
const PORTRAIT_RATIO = 800 / 1422;
const LANDSCAPE_RATIO = 1600 / 900;
const DESKTOP_RATIO = 1422 / 800;

const DESKTOP_HEIGHT = 800;
const LANDSCAPE_HEIGHT = 900;
const PORTRAIT_HEIGHT = 1422;
export const DESKTOP_MAIN_SIZES = { width: DESKTOP_HEIGHT * DESKTOP_RATIO, height: DESKTOP_HEIGHT };
export const LANDSCAPE_MAIN_SIZES = {
	width: LANDSCAPE_HEIGHT * LANDSCAPE_RATIO,
	height: LANDSCAPE_HEIGHT,
};
export const PORTRAIT_MAIN_SIZES = {
	width: PORTRAIT_HEIGHT * PORTRAIT_RATIO,
	height: PORTRAIT_HEIGHT,
};

export const HIGH_SYMBOLS = ['H1', 'H2', 'H3', 'H4'];

export const INITIAL_SYMBOL_STATE: SymbolState = 'static';

const HIGH_SYMBOL_SIZE = 0.9;
const LOW_SYMBOL_SIZE = 0.9;
const SCATTER_SYMBOL_SIZE = 1;

export const SPIN_OPTIONS_DEFAULT = {
	reelFallInDelay: 80,
	reelPaddingMultiplierNormal: 1.25,
	reelPaddingMultiplierAnticipated: 18,
	reelFallOutDelay: 145,
	symbolFallInSpeed: 3.5,
	symbolFallInInterval: 30,
	symbolFallInBounceSpeed: 0.15,
	symbolFallInBounceSizeMulti: 0.5,
	symbolFallOutSpeed: 3.5,
	symbolFallOutInterval: 20,
};

export const SPIN_OPTIONS_FAST = {
	reelFallInDelay: 30,
	reelPaddingMultiplierNormal: 1.25,
	reelPaddingMultiplierAnticipated: 4,
	reelFallOutDelay: 50,
	symbolFallInSpeed: 7,
	symbolFallInInterval: 0,
	symbolFallInBounceSpeed: 0.3,
	symbolFallInBounceSizeMulti: 0.25,
	symbolFallOutSpeed: 7,
	symbolFallOutInterval: 0,
};

export const MOTION_BLUR_VELOCITY = 31;

export const zIndexes = {
	background: {
		backdrop: -3,
		normal: -2,
		feature: -1,
	},
};

// Symbol sprites — assetKey must match manifest key in assets.ts
// H1=Elder H2=Countess H3=Knight H4=Feral L1=Jack L2=Queen L3=King L4=Ace SC=Coffin PT=Chalice

// Static state: H=hungry, L=full
const h1Static = { type: 'sprite', assetKey: 'symbolElderHungry', sizeRatios: { width: 1, height: 1 } };
const h2Static = { type: 'sprite', assetKey: 'symbolCountessHungry', sizeRatios: { width: 1, height: 1 } };
const h3Static = { type: 'sprite', assetKey: 'symbolKnightHungry', sizeRatios: { width: 1, height: 1 } };
const h4Static = { type: 'sprite', assetKey: 'symbolFeralHungry', sizeRatios: { width: 1, height: 1 } };

const l1Static = { type: 'sprite', assetKey: 'symbolJackFull', sizeRatios: { width: 1, height: 1 } };
const l2Static = { type: 'sprite', assetKey: 'symbolQueenFull', sizeRatios: { width: 1, height: 1 } };
const l3Static = { type: 'sprite', assetKey: 'symbolKingFull', sizeRatios: { width: 1, height: 1 } };
const l4Static = { type: 'sprite', assetKey: 'symbolAceFull', sizeRatios: { width: 1, height: 1 } };

const scStatic = { type: 'sprite', assetKey: 'symbolCoffin', sizeRatios: { width: 1.243, height: 1.243 } };
const ptStatic = { type: 'sprite', assetKey: 'symbolChalice', sizeRatios: { width: 1, height: 1 } };

// Win state: H=fed (vampires drink), L=empty (vials drained)
const h1Win = { type: 'sprite', assetKey: 'symbolElderFed', sizeRatios: { width: 1, height: 1 } };
const h2Win = { type: 'sprite', assetKey: 'symbolCountessFed', sizeRatios: { width: 1, height: 1 } };
const h3Win = { type: 'sprite', assetKey: 'symbolKnightFed', sizeRatios: { width: 1, height: 1 } };
const h4Win = { type: 'sprite', assetKey: 'symbolFeralFed', sizeRatios: { width: 1, height: 1 } };

const l1Win = { type: 'sprite', assetKey: 'symbolJackEmpty', sizeRatios: { width: 1, height: 1 } };
const l2Win = { type: 'sprite', assetKey: 'symbolQueenEmpty', sizeRatios: { width: 1, height: 1 } };
const l3Win = { type: 'sprite', assetKey: 'symbolKingEmpty', sizeRatios: { width: 1, height: 1 } };
const l4Win = { type: 'sprite', assetKey: 'symbolAceEmpty', sizeRatios: { width: 1, height: 1 } };

// Explosion state: sprite type → oncomplete fires immediately, blood orbs provide the visual
export const SYMBOL_INFO_MAP = {
	H1: {
		explosion: h1Static,
		win: h1Win,
		postWinStatic: h1Static,
		static: h1Static,
		spin: h1Static,
		land: h1Static,
	},
	H2: {
		explosion: h2Static,
		win: h2Win,
		postWinStatic: h2Static,
		static: h2Static,
		spin: h2Static,
		land: h2Static,
	},
	H3: {
		explosion: h3Static,
		win: h3Win,
		postWinStatic: h3Static,
		static: h3Static,
		spin: h3Static,
		land: h3Static,
	},
	H4: {
		explosion: h4Static,
		win: h4Win,
		postWinStatic: h4Static,
		static: h4Static,
		spin: h4Static,
		land: h4Static,
	},
	L1: {
		explosion: l1Static,
		win: l1Win,
		postWinStatic: l1Win,
		static: l1Static,
		spin: l1Static,
		land: l1Static,
	},
	L2: {
		explosion: l2Static,
		win: l2Win,
		postWinStatic: l2Win,
		static: l2Static,
		spin: l2Static,
		land: l2Static,
	},
	L3: {
		explosion: l3Static,
		win: l3Win,
		postWinStatic: l3Win,
		static: l3Static,
		spin: l3Static,
		land: l3Static,
	},
	L4: {
		explosion: l4Static,
		win: l4Win,
		postWinStatic: l4Win,
		static: l4Static,
		spin: l4Static,
		land: l4Static,
	},
	SC: {
		explosion: scStatic,
		postWinStatic: scStatic,
		static: scStatic,
		spin: scStatic,
		win: scStatic,
		land: scStatic,
	},
	PT: {
		explosion: ptStatic,
		win: ptStatic,
		postWinStatic: ptStatic,
		static: ptStatic,
		spin: ptStatic,
		land: ptStatic,
	},
} as const;

export const SCATTER_LAND_SOUND_MAP = {
	1: 'sfx_scatter_stop_1',
	2: 'sfx_scatter_stop_2',
	3: 'sfx_scatter_stop_3',
	4: 'sfx_scatter_stop_4',
	5: 'sfx_scatter_stop_5',
	6: 'sfx_scatter_stop_6',
} as const;
