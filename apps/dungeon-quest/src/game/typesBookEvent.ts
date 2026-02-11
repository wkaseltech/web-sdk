import type { BetType } from 'rgs-requests';

import type { SymbolName, RawSymbol, GameType, Position } from './types';

type BookEventReveal = {
	index: number;
	type: 'reveal';
	board: RawSymbol[][];
	paddingPositions: number[];
	anticipation: number[];
	gameType: GameType;
};

type BookEventWinInfo = {
	index: number;
	type: 'winInfo';
	totalWin: number;
	wins: {
		symbol: SymbolName;
		win: number;
		positions: Position[];
		meta: {
			globalMult: number;
			clusterMult: number;
			winWithoutMult: number;
			overlay: Position;
		};
	}[];
};

type BookEventSetTumbleWin = {
	index: number;
	type: 'updateTumbleWin';
	amount: number;
};

type BookEventSetTotalWin = {
	index: number;
	type: 'setTotalWin';
	amount: number;
};

type BookEventFreeSpinTrigger = {
	index: number;
	type: 'freeSpinTrigger';
	totalFs: number;
	positions: Position[];
};

type BookEventUpdateFreeSpin = {
	index: number;
	type: 'updateFreeSpin';
	amount: number;
	total: number;
};

type BookEventFreeSpinEnd = {
	index: number;
	type: 'freeSpinEnd';
	amount: number;
	winLevel: number;
};

type BookEventTumbleBoard = {
	index: number;
	type: 'tumbleBoard';
	explodingSymbols: Position[];
	newSymbols: RawSymbol[][];
};

type BookEventFinalWin = {
	index: number;
	type: 'finalWin';
	amount: number;
};

type BookEventSetWin = {
	index: number;
	type: 'setWin';
	amount: number;
	winLevel: number;
};

// DQ custom events
type BookEventUpdateXP = {
	index: number;
	type: 'updateXP';
	clusterCount: number;
	level: number;
	multiplier: number;
	escalating: boolean;
	xpToNextLevel: number;
};

type BookEventHeroStateChange = {
	index: number;
	type: 'heroStateChange';
	pose: 'idle' | 'level2' | 'bonus_stance' | 'boss_stance';
	level: number;
};

type BookEventMusicChange = {
	index: number;
	type: 'musicChange';
	track: string;
	trigger: string;
};

type BookEventPotionCollected = {
	index: number;
	type: 'potionCollected';
	potionCount: number;
	positions: Position[];
	extraSpins: number;
	newTotalSpins: number;
	currentSpin: number;
	replacements: { reel: number; row: number; name: string }[];
	postBoard: RawSymbol[][];
};

// customised
type BookEventCreateBonusSnapshot = {
	index: number;
	type: 'createBonusSnapshot';
	bookEvents: BookEvent[];
};

export type BookEvent =
	| BookEventReveal
	| BookEventWinInfo
	| BookEventSetTumbleWin
	| BookEventSetTotalWin
	| BookEventFreeSpinTrigger
	| BookEventUpdateFreeSpin
	| BookEventTumbleBoard
	| BookEventFinalWin
	| BookEventSetWin
	| BookEventFreeSpinEnd
	// DQ custom
	| BookEventUpdateXP
	| BookEventHeroStateChange
	| BookEventMusicChange
	| BookEventPotionCollected
	// customised
	| BookEventCreateBonusSnapshot;

export type Bet = BetType<BookEvent>;
export type BookEventOfType<T> = Extract<BookEvent, { type: T }>;
export type BookEventContext = { bookEvents: BookEvent[] };
