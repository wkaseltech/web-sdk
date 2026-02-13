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

// Vampire Slots custom events
type BookEventGaugeUpdate = {
	index: number;
	type: 'gaugeUpdate';
	level: number;
	delta: number;
	segment: number;
	multiplier: number;
};

type BookEventBloodMoon = {
	index: number;
	type: 'bloodMoon';
	extraSpins: number;
	lockedSpins: number;
	multiplier: number;
};

type BookEventBloodMoonEnd = {
	index: number;
	type: 'bloodMoonEnd';
	gaugeLevel: number;
	segment: number;
	multiplier: number;
};

type BookEventChaliceAbsorb = {
	index: number;
	type: 'chaliceAbsorb';
	ptPositions: Position[];
	lPositions: Position[];
	lCount: number;
	gaugeDelta: number;
	gaugeLevel: number;
	segment: number;
	multiplier: number;
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
	// Vampire Slots custom
	| BookEventGaugeUpdate
	| BookEventBloodMoon
	| BookEventBloodMoonEnd
	| BookEventChaliceAbsorb
	// customised
	| BookEventCreateBonusSnapshot;

export type Bet = BetType<BookEvent>;
export type BookEventOfType<T> = Extract<BookEvent, { type: T }>;
export type BookEventContext = { bookEvents: BookEvent[] };
