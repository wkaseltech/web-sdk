import _ from 'lodash';

import { recordBookEvent, checkIsMultipleRevealEvents, type BookEventHandlerMap } from 'utils-book';
import { stateBet } from 'state-shared';

import { eventEmitter } from './eventEmitter';
import { playBookEvent } from './utils';
import { winLevelMap, type WinLevel, type WinLevelData } from './winLevelMap';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import type { BookEvent, BookEventOfType, BookEventContext } from './typesBookEvent';
import type { Position } from './types';
import { HIGH_SYMBOLS } from './constants';

const winLevelSoundsPlay = ({ winLevelData }: { winLevelData: WinLevelData }) => {
	if (winLevelData?.alias === 'max') eventEmitter.broadcastAsync({ type: 'uiHide' });
	if (winLevelData?.sound?.sfx) {
		eventEmitter.broadcast({ type: 'soundOnce', name: winLevelData.sound.sfx });
	}
	if (winLevelData?.sound?.bgm) {
		eventEmitter.broadcast({ type: 'soundMusic', name: winLevelData.sound.bgm });
	}
	if (winLevelData?.type === 'big') {
		eventEmitter.broadcast({ type: 'soundLoop', name: 'sfx_bigwin_coinloop' });
	}
};

const winLevelSoundsStop = () => {
	eventEmitter.broadcast({ type: 'soundStop', name: 'sfx_bigwin_coinloop' });
	if (stateBet.activeBetModeKey === 'SUPERSPIN' || stateGame.gameType === 'freegame') {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
	} else {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_main' });
	}
	eventEmitter.broadcastAsync({ type: 'uiShow' });
};

const animateSymbols = async ({ positions }: { positions: Position[] }) => {
	eventEmitter.broadcast({ type: 'boardShow' });
	await eventEmitter.broadcastAsync({
		type: 'boardWithAnimateSymbols',
		symbolPositions: positions,
	});
};

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	reveal: async (bookEvent: BookEventOfType<'reveal'>, { bookEvents }: BookEventContext) => {
		eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
		eventEmitter.broadcast({ type: 'spinSoundPlay' });
		const isBonusGame = checkIsMultipleRevealEvents({ bookEvents });
		if (isBonusGame) {
			eventEmitter.broadcast({ type: 'stopButtonEnable' });
			recordBookEvent({ bookEvent });
		}

		// Reset gauge at start of each spin (base game: fresh per spin, bonus: persists via gaugeUpdate events)
		if (!isBonusGame) {
			stateGame.gaugeLevel = 0;
			stateGame.gaugeSegment = 1;
			stateGame.gaugeMultiplier = 1;
			eventEmitter.broadcast({
				type: 'bloodGaugeUpdate',
				level: 0,
				segment: 1,
				multiplier: 1,
			});
		}

		stateGame.gameType = bookEvent.gameType;
		await stateGameDerived.enhancedBoard.spin({ revealEvent: bookEvent });
		eventEmitter.broadcast({ type: 'soundScatterCounterClear' });
	},
	winInfo: async (bookEvent: BookEventOfType<'winInfo'>, { bookEvents }: BookEventContext) => {
		const lWins = bookEvent.wins.filter((w) => !HIGH_SYMBOLS.includes(w.symbol));
		const hWins = bookEvent.wins.filter((w) => HIGH_SYMBOLS.includes(w.symbol));

		const showWins = async (
			wins: typeof bookEvent.wins,
			playSound: boolean,
			skipBoardShow = false,
		) => {
			const positions = _.flatten(wins.map((w) => w.positions));
			const p1 = async () => {
				if (playSound) eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_winlevel_small' });
				if (!skipBoardShow) eventEmitter.broadcast({ type: 'boardShow' });
				await eventEmitter.broadcastAsync({
					type: 'boardWithAnimateSymbols',
					symbolPositions: positions,
				});
			};
			const p2 = async () => {
				await eventEmitter.broadcastAsync({
					type: 'showClusterWinAmounts',
					wins: wins.map((win) => ({
						win: win.meta.winWithoutMult,
						mult: win.meta.globalMult,
						result: win.meta.winWithoutMult * win.meta.globalMult,
						reel: win.meta.overlay.reel,
						row: win.meta.overlay.row,
					})),
				});
			};
			await Promise.all([p1(), p2()]);
		};

		if (lWins.length > 0 && hWins.length > 0) {
			// Mixed L+H wins: sequential — vials drain first, gauge fills, then vampires empower
			await showWins(lWins, true);

			// Apply upcoming gauge update so H symbols see the new multiplier
			const nextGaugeUpdate = bookEvents.find(
				(e) => e.type === 'gaugeUpdate' && e.index > bookEvent.index,
			) as BookEventOfType<'gaugeUpdate'> | undefined;
			if (nextGaugeUpdate) {
				stateGame.gaugeLevel = nextGaugeUpdate.level;
				stateGame.gaugeSegment = nextGaugeUpdate.segment;
				stateGame.gaugeMultiplier = nextGaugeUpdate.multiplier;
				eventEmitter.broadcast({
					type: 'bloodGaugeUpdate',
					level: nextGaugeUpdate.level,
					segment: nextGaugeUpdate.segment,
					multiplier: nextGaugeUpdate.multiplier,
				});
			}

			// Skip boardShow so L symbols stay in their post-animation (drained) state
			await showWins(hWins, false, true);
		} else {
			// Only L or only H wins — animate all at once
			await showWins(bookEvent.wins, true);
		}
	},
	updateTumbleWin: async (bookEvent: BookEventOfType<'updateTumbleWin'>) => {
		if (bookEvent.amount > 0) {
			eventEmitter.broadcast({ type: 'tumbleWinAmountShow' });
			eventEmitter.broadcast({
				type: 'tumbleWinAmountUpdate',
				amount: bookEvent.amount,
				animate: false,
			});
		}
	},
	setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>) => {
		stateBet.winBookEventAmount = bookEvent.amount;
	},
	freeSpinTrigger: async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
		// animate coffin scatters
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win_v2' });
		await animateSymbols({ positions: bookEvent.positions });
		// transition into bonus
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_superfreespin' });
		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'jng_intro_fs' });
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinIntroUpdate',
			totalFreeSpins: bookEvent.totalFs,
		});
		stateGame.gameType = 'freegame';
		eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
		eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
		// Show Blood Gauge for bonus
		eventEmitter.broadcast({ type: 'bloodGaugeShow' });
		eventEmitter.broadcast({
			type: 'bloodGaugeUpdate',
			level: 0,
			segment: 1,
			multiplier: 1,
		});
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: undefined,
			total: bookEvent.totalFs,
		});
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerButtonShow' });
		eventEmitter.broadcast({ type: 'drawerFold' });
	},
	updateFreeSpin: async (bookEvent: BookEventOfType<'updateFreeSpin'>) => {
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: bookEvent.amount,
			total: bookEvent.total,
		});
	},
	freeSpinEnd: async (bookEvent: BookEventOfType<'freeSpinEnd'>) => {
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		stateGame.gameType = 'basegame';
		// Reset Blood Gauge state
		stateGame.gaugeLevel = 0;
		stateGame.gaugeSegment = 1;
		stateGame.gaugeMultiplier = 1;
		stateGame.bloodMoonActive = false;
		stateGame.bloodMoonSpinsLeft = 0;
		eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
		eventEmitter.broadcast({ type: 'bloodGaugeHide' });
		eventEmitter.broadcast({ type: 'freeSpinOutroShow' });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_youwon_panel' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinOutroCountUp',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'freeSpinOutroHide' });
		eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerUnfold' });
		eventEmitter.broadcast({ type: 'drawerButtonHide' });
	},
	tumbleBoard: async (bookEvent: BookEventOfType<'tumbleBoard'>) => {
		eventEmitter.broadcast({ type: 'boardHide' });
		eventEmitter.broadcast({ type: 'tumbleBoardShow' });
		eventEmitter.broadcast({ type: 'tumbleBoardInit', addingBoard: bookEvent.newSymbols });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_explosion_b' });
		await eventEmitter.broadcastAsync({
			type: 'tumbleBoardExplode',
			explodingPositions: bookEvent.explodingSymbols,
		});
		eventEmitter.broadcast({ type: 'tumbleBoardRemoveExploded' });
		await eventEmitter.broadcastAsync({ type: 'tumbleBoardSlideDown' });
		eventEmitter.broadcast({
			type: 'boardSettle',
			board: stateGameDerived
				.tumbleBoardCombined()
				.map((tumbleReel) => tumbleReel.map((tumbleSymbol) => tumbleSymbol.rawSymbol)),
		});
		eventEmitter.broadcast({ type: 'tumbleBoardReset' });
		eventEmitter.broadcast({ type: 'tumbleBoardHide' });
		eventEmitter.broadcast({ type: 'boardShow' });
	},
	setWin: async (bookEvent: BookEventOfType<'setWin'>) => {
		// Only show win presentation for wins >= 30x bet
		const winMultiple = bookEvent.amount / (stateBet.betAmount * 100);
		if (winMultiple < 30) return;

		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

		eventEmitter.broadcast({ type: 'winShow' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'winUpdate',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'winHide' });
	},
	finalWin: async (bookEvent: BookEventOfType<'finalWin'>) => {
		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
	},
	// Vampire Slots custom handlers
	gaugeUpdate: async (bookEvent: BookEventOfType<'gaugeUpdate'>) => {
		stateGame.gaugeLevel = bookEvent.level;
		stateGame.gaugeSegment = bookEvent.segment;
		stateGame.gaugeMultiplier = bookEvent.multiplier;
		eventEmitter.broadcast({
			type: 'bloodGaugeUpdate',
			level: bookEvent.level,
			segment: bookEvent.segment,
			multiplier: bookEvent.multiplier,
		});
	},
	chaliceAbsorb: async (bookEvent: BookEventOfType<'chaliceAbsorb'>) => {
		// Switch ALL L symbols on board to empty state (vials drained by chalice)
		for (const reel of stateGame.board) {
			for (const sym of reel.reelState.symbols) {
				if (['L1', 'L2', 'L3', 'L4'].includes(sym.rawSymbol.name)) {
					sym.symbolState = 'win';
				}
			}
		}

		// Multi-phase animation: orbs burst out → orbit chalice → absorb → shake → shoot to gauge
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_explosion_b' });

		// broadcastAsync waits for ChaliceAbsorb component's promise to resolve
		await eventEmitter.broadcastAsync({
			type: 'chaliceAbsorbStart',
			lPositions: bookEvent.lPositions,
			ptPositions: bookEvent.ptPositions,
			gaugeLevel: bookEvent.gaugeLevel,
			segment: bookEvent.segment,
			multiplier: bookEvent.multiplier,
		});

		// Update gauge state after animation completes
		stateGame.gaugeLevel = bookEvent.gaugeLevel;
		stateGame.gaugeSegment = bookEvent.segment;
		stateGame.gaugeMultiplier = bookEvent.multiplier;
		eventEmitter.broadcast({
			type: 'bloodGaugeUpdate',
			level: bookEvent.gaugeLevel,
			segment: bookEvent.segment,
			multiplier: bookEvent.multiplier,
		});
	},
	bloodMoon: async (bookEvent: BookEventOfType<'bloodMoon'>) => {
		stateGame.bloodMoonActive = true;
		stateGame.bloodMoonSpinsLeft = bookEvent.lockedSpins;
		stateGame.gaugeMultiplier = bookEvent.multiplier;
		// TODO: Blood Moon visual effect
	},
	bloodMoonEnd: async (bookEvent: BookEventOfType<'bloodMoonEnd'>) => {
		stateGame.bloodMoonActive = false;
		stateGame.bloodMoonSpinsLeft = 0;
		stateGame.gaugeLevel = bookEvent.gaugeLevel;
		stateGame.gaugeSegment = bookEvent.segment;
		stateGame.gaugeMultiplier = bookEvent.multiplier;
		eventEmitter.broadcast({
			type: 'bloodGaugeUpdate',
			level: bookEvent.gaugeLevel,
			segment: bookEvent.segment,
			multiplier: bookEvent.multiplier,
		});
	},
	// customised
	createBonusSnapshot: async (bookEvent: BookEventOfType<'createBonusSnapshot'>) => {
		const { bookEvents } = bookEvent;

		function findLastBookEvent<T>(type: T) {
			return _.findLast(bookEvents, (bookEvent) => bookEvent.type === type) as
				| BookEventOfType<T>
				| undefined;
		}

		const lastFreeSpinTriggerEvent = findLastBookEvent('freeSpinTrigger' as const);
		const lastUpdateFreeSpinEvent = findLastBookEvent('updateFreeSpin' as const);
		const lastSetTotalWinEvent = findLastBookEvent('setTotalWin' as const);
		const lastGaugeUpdateEvent = findLastBookEvent('gaugeUpdate' as const);

		if (lastFreeSpinTriggerEvent) await playBookEvent(lastFreeSpinTriggerEvent, { bookEvents });
		if (lastUpdateFreeSpinEvent) playBookEvent(lastUpdateFreeSpinEvent, { bookEvents });
		if (lastSetTotalWinEvent) playBookEvent(lastSetTotalWinEvent, { bookEvents });
		if (lastGaugeUpdateEvent) playBookEvent(lastGaugeUpdateEvent, { bookEvents });
	},
};
