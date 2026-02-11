import _ from 'lodash';

import type { RawSymbol, SymbolState } from './types';

export const SYMBOL_SIZE = 80;

export const REEL_PADDING = 0.53;

// initial board: 4 reels (columns) × 8 symbols each (6 visible + 1 padding top + 1 padding bottom)
// Grid: 4 wide × 6 tall
// Symbols: H1(Lich) H2(Dragon) H3(Lizardman) H4(Goblin) L1(Skeleton) L2(Spider) L3(Bat) SC(Key)
export const INITIAL_BOARD: RawSymbol[][] = [
	[{ name: 'L1' }, { name: 'H1' }, { name: 'L2' }, { name: 'L3' }, { name: 'H4' }, { name: 'H3' }, { name: 'L2' }, { name: 'H2' }],
	[{ name: 'L2' }, { name: 'L3' }, { name: 'H2' }, { name: 'H4' }, { name: 'L2' }, { name: 'H1' }, { name: 'L3' }, { name: 'L1' }],
	[{ name: 'L3' }, { name: 'H3' }, { name: 'L1' }, { name: 'H4' }, { name: 'H1' }, { name: 'L2' }, { name: 'H2' }, { name: 'H4' }],
	[{ name: 'H4' }, { name: 'L1' }, { name: 'H2' }, { name: 'H3' }, { name: 'L3' }, { name: 'L3' }, { name: 'L1' }, { name: 'H1' }],
];

// BOARD_DIMENSIONS: x = numReels(4), y = visible rows (8 - 2 padding = 6)
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

const SPIN_OPTIONS_SHARED = {
	reelFallInDelay: 80,
	reelPaddingMultiplierNormal: 1.25,
	reelPaddingMultiplierAnticipated: 18,
	reelFallOutDelay: 145,
};

export const SPIN_OPTIONS_DEFAULT = {
	...SPIN_OPTIONS_SHARED,
	symbolFallInSpeed: 3.5,
	symbolFallInInterval: 30,
	symbolFallInBounceSpeed: 0.15,
	symbolFallInBounceSizeMulti: 0.5,
	symbolFallOutSpeed: 3.5,
	symbolFallOutInterval: 20,
};

export const SPIN_OPTIONS_FAST = {
	...SPIN_OPTIONS_SHARED,
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

const explosion = {
	type: 'spine',
	assetKey: 'explosion',
	animationName: 'explosion',
	sizeRatios: { width: 1, height: 1 },
};

// Symbol sprites — assetKey must match manifest key in assets.ts
// H1=Lich H2=Dragon H3=Lizardman H4=Goblin L1=Skeleton L2=Spider L3=Bat SC=Key PT=Potion
const h1Static = { type: 'sprite', assetKey: 'symbolLich', sizeRatios: { width: 1, height: 1 } };
const h2Static = { type: 'sprite', assetKey: 'symbolDragon', sizeRatios: { width: 1, height: 1 } };
const h3Static = { type: 'sprite', assetKey: 'symbolLizardman', sizeRatios: { width: 1, height: 1 } };
const h4Static = { type: 'sprite', assetKey: 'symbolGoblin', sizeRatios: { width: 1, height: 1 } };

const l1Static = { type: 'sprite', assetKey: 'symbolSkeleton', sizeRatios: { width: 1, height: 1 } };
const l2Static = { type: 'sprite', assetKey: 'symbolSpider', sizeRatios: { width: 1, height: 1 } };
const l3Static = { type: 'sprite', assetKey: 'symbolBat', sizeRatios: { width: 1, height: 1 } };

const scStatic = { type: 'sprite', assetKey: 'symbolKey', sizeRatios: { width: 1.243, height: 1.243 } };
const ptStatic = { type: 'sprite', assetKey: 'symbolPotion', sizeRatios: { width: 1, height: 1 } };

export const SYMBOL_INFO_MAP = {
	H1: {
		explosion,
		win: h1Static,
		postWinStatic: h1Static,
		static: h1Static,
		spin: h1Static,
		land: h1Static,
	},
	H2: {
		explosion,
		win: h2Static,
		postWinStatic: h2Static,
		static: h2Static,
		spin: h2Static,
		land: h2Static,
	},
	H3: {
		explosion,
		win: h3Static,
		postWinStatic: h3Static,
		static: h3Static,
		spin: h3Static,
		land: h3Static,
	},
	H4: {
		explosion,
		win: h4Static,
		postWinStatic: h4Static,
		static: h4Static,
		spin: h4Static,
		land: h4Static,
	},
	L1: {
		explosion,
		win: l1Static,
		postWinStatic: l1Static,
		static: l1Static,
		spin: l1Static,
		land: l1Static,
	},
	L2: {
		explosion,
		win: l2Static,
		postWinStatic: l2Static,
		static: l2Static,
		spin: l2Static,
		land: l2Static,
	},
	L3: {
		explosion,
		win: l3Static,
		postWinStatic: l3Static,
		static: l3Static,
		spin: l3Static,
		land: l3Static,
	},
	SC: {
		explosion,
		postWinStatic: scStatic,
		static: scStatic,
		spin: scStatic,
		win: scStatic,
		land: scStatic,
	},
	PT: {
		explosion,
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
} as const;
