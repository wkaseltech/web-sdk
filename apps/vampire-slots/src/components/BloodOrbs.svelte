<script lang="ts" module>
	export type EmitterEventBloodOrbs = {
		type: 'bloodOrbsSpawn';
		positions: { reel: number; row: number }[];
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Graphics } from 'pixi-svelte';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, BOARD_SIZES, HIGH_SYMBOLS } from '../game/constants';

	const context = getContext();

	// Gauge position (LEFT side of board — must match BloodGauge.svelte)
	const GAUGE_WIDTH = SYMBOL_SIZE * 0.4;
	const FRAME_HALF_WIDTH = (BOARD_SIZES.width * 1.05) / 2;
	const GAUGE_X = -FRAME_HALF_WIDTH - GAUGE_WIDTH;
	const GAUGE_HEIGHT = BOARD_SIZES.height * 0.85;
	const GAUGE_Y_OFFSET = -GAUGE_HEIGHT * 0.35;

	// Gauge center — orb target/source
	const GAUGE_CENTER_X = GAUGE_X + GAUGE_WIDTH * 0.5;
	const GAUGE_CENTER_Y = GAUGE_Y_OFFSET + GAUGE_HEIGHT * 0.5;

	const SEGMENT_COLORS = [0x661111, 0x882222, 0xaa2222, 0xcc1111, 0xff0000];
	const ORB_DURATION = 700;
	const ORB_STAGGER = 40;
	const ORB_RADIUS = 6;

	type Orb = {
		id: number;
		startX: number;
		startY: number;
		cp1X: number;
		cp1Y: number;
		cp2X: number;
		cp2Y: number;
		endX: number;
		endY: number;
		startTime: number;
		duration: number;
		color: number;
		currentX: number;
		currentY: number;
		currentAlpha: number;
	};

	let orbs = $state<Orb[]>([]);
	let animFrame = 0;
	let currentSegment = 1;
	let nextOrbId = 0;

	function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
		const u = 1 - t;
		return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
	}

	function easeInOutCubic(t: number): number {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}

	function createOrb(
		sx: number,
		sy: number,
		ex: number,
		ey: number,
		delay: number,
		color: number,
	): Orb {
		const dx = sx - ex;
		const dy = sy - ey;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const nx = dx / (dist || 1);
		const ny = dy / (dist || 1);

		const perpX = -ny;
		const perpY = nx;
		const arcSign = Math.random() > 0.5 ? 1 : -1;
		const arcAmount = 60 + Math.random() * 100;

		const blastDist = 80 + Math.random() * 60;
		const cp1X = sx + nx * blastDist + perpX * arcSign * arcAmount * 0.3;
		const cp1Y = sy + ny * blastDist + perpY * arcSign * arcAmount * 0.3;

		const midX = (sx + ex) / 2;
		const midY = (sy + ey) / 2;
		const cp2X = midX + perpX * arcSign * arcAmount;
		const cp2Y = midY + perpY * arcSign * arcAmount;

		return {
			id: nextOrbId++,
			startX: sx,
			startY: sy,
			cp1X,
			cp1Y,
			cp2X,
			cp2Y,
			endX: ex,
			endY: ey,
			startTime: performance.now() + delay,
			duration: ORB_DURATION + Math.random() * 150,
			color,
			currentX: sx,
			currentY: sy,
			currentAlpha: 0,
		};
	}

	function spawnOrbs(positions: { reel: number; row: number; symbolName: string }[]) {
		const color = SEGMENT_COLORS[Math.min(currentSegment - 1, SEGMENT_COLORS.length - 1)];
		const hasMultiplier = currentSegment >= 2;

		const newOrbs: Orb[] = [];
		let delay = 0;

		for (const pos of positions) {
			const symbolX = pos.reel * SYMBOL_SIZE + SYMBOL_SIZE / 2;
			const symbolY = (pos.row - 1) * SYMBOL_SIZE + SYMBOL_SIZE / 2;
			const isHigh = HIGH_SYMBOLS.includes(pos.symbolName);

			if (isHigh) {
				// H symbols (vampires): orbs fly FROM gauge TO symbol — only if gauge has multiplier
				if (!hasMultiplier) continue;
				newOrbs.push(
					createOrb(GAUGE_CENTER_X, GAUGE_CENTER_Y, symbolX, symbolY, delay, color),
				);
			} else {
				// L symbols (vials): orbs fly FROM symbol TO gauge
				newOrbs.push(
					createOrb(symbolX, symbolY, GAUGE_CENTER_X, GAUGE_CENTER_Y, delay, color),
				);
			}
			delay += ORB_STAGGER;
		}

		orbs = [...orbs, ...newOrbs];
	}

	function animate() {
		const now = performance.now();

		for (const orb of orbs) {
			const elapsed = now - orb.startTime;
			if (elapsed < 0) continue;
			const t = Math.min(elapsed / orb.duration, 1);
			if (t >= 1) continue;
			const et = easeInOutCubic(t);
			orb.currentX = cubicBezier(et, orb.startX, orb.cp1X, orb.cp2X, orb.endX);
			orb.currentY = cubicBezier(et, orb.startY, orb.cp1Y, orb.cp2Y, orb.endY);
			orb.currentAlpha = t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 1;
		}

		// Remove expired orbs
		const alive = orbs.filter((orb) => now < orb.startTime + orb.duration);
		if (alive.length !== orbs.length) {
			orbs = alive;
		}

		animFrame = requestAnimationFrame(animate);
	}

	context.eventEmitter.subscribeOnMount({
		boardWithAnimateSymbols: ({ symbolPositions }) => {
			// Orbs spawn when symbols transition to win state (full→empty / hungry→fed)
			const positionsWithNames = symbolPositions.map((pos) => {
				const reelSymbol = context.stateGame.board[pos.reel].reelState.symbols[pos.row];
				return {
					reel: pos.reel,
					row: pos.row,
					symbolName: reelSymbol.rawSymbol.name,
				};
			});

			spawnOrbs(positionsWithNames);
		},
		bloodGaugeHide: () => {
			currentSegment = 1;
		},
		bloodGaugeUpdate: (event) => {
			currentSegment = event.segment;
		},
	});

	onMount(() => {
		animFrame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animFrame);
	});
</script>

<BoardContainer>
	{#each orbs as orb (orb.id)}
		<Graphics
			x={orb.currentX}
			y={orb.currentY}
			alpha={orb.currentAlpha}
			tint={orb.color}
			draw={(g) => {
				g.clear();
				// Outer glow
				g.beginFill(0xffffff, 0.3);
				g.drawCircle(0, 0, ORB_RADIUS * 2);
				g.endFill();
				// Core
				g.beginFill(0xffffff, 0.9);
				g.drawCircle(0, 0, ORB_RADIUS * 0.6);
				g.endFill();
				g.beginFill(0xffffff, 0.7);
				g.drawCircle(0, 0, ORB_RADIUS);
				g.endFill();
			}}
		/>
	{/each}
</BoardContainer>
