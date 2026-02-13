<script lang="ts" module>
	export type EmitterEventChaliceAbsorb = {
		type: 'chaliceAbsorbStart';
		lPositions: { reel: number; row: number }[];
		ptPositions: { reel: number; row: number }[];
		gaugeLevel: number;
		segment: number;
		multiplier: number;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Graphics } from 'pixi-svelte';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, BOARD_SIZES } from '../game/constants';

	const context = getContext();

	// Gauge position (must match BloodGauge.svelte / BloodOrbs.svelte)
	const GAUGE_WIDTH = SYMBOL_SIZE * 0.4;
	const FRAME_HALF_WIDTH = (BOARD_SIZES.width * 1.05) / 2;
	const GAUGE_X = -FRAME_HALF_WIDTH - GAUGE_WIDTH;
	const GAUGE_HEIGHT = BOARD_SIZES.height * 0.85;
	const GAUGE_Y_OFFSET = -GAUGE_HEIGHT * 0.35;
	const GAUGE_CENTER_X = GAUGE_X + GAUGE_WIDTH * 0.5;
	const GAUGE_CENTER_Y = GAUGE_Y_OFFSET + GAUGE_HEIGHT * 0.5;

	const SEGMENT_COLORS = [0x661111, 0x882222, 0xaa2222, 0xcc1111, 0xff0000];

	// Phase timing (ms)
	const BURST_DURATION = 300;
	const ORBIT_DURATION = 800;
	const SHAKE_DURATION = 400;
	const SHOOT_DURATION = 500;
	const ORB_STAGGER = 15; // stagger between orb spawns
	const ORB_RADIUS = 5;

	type AbsorbOrb = {
		id: number;
		// Origin (L symbol position)
		originX: number;
		originY: number;
		// Burst endpoint (outward from origin)
		burstX: number;
		burstY: number;
		// Orbit params
		orbitStartAngle: number;
		orbitStartRadius: number;
		orbitRotations: number;
		// Target (chalice position)
		targetX: number;
		targetY: number;
		// Timing
		startTime: number;
		burstEnd: number;
		orbitEnd: number;
		// Render state
		currentX: number;
		currentY: number;
		currentAlpha: number;
		currentScale: number;
		color: number;
	};

	type ShootOrb = {
		id: number;
		startX: number;
		startY: number;
		endX: number;
		endY: number;
		cp1X: number;
		cp1Y: number;
		cp2X: number;
		cp2Y: number;
		startTime: number;
		duration: number;
		currentX: number;
		currentY: number;
		currentAlpha: number;
		currentScale: number;
		color: number;
	};

	let absorbOrbs = $state<AbsorbOrb[]>([]);
	let shootOrbs = $state<ShootOrb[]>([]);
	let chaliceShake = $state({ active: false, baseX: 0, baseY: 0, offsetX: 0, offsetY: 0, startTime: 0 });
	let animFrame = 0;
	let nextId = 0;

	function easeOutCubic(t: number): number {
		return 1 - Math.pow(1 - t, 3);
	}

	function easeInCubic(t: number): number {
		return t * t * t;
	}

	function easeInOutCubic(t: number): number {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}

	function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
		const u = 1 - t;
		return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
	}

	function posToPixel(pos: { reel: number; row: number }) {
		return {
			x: pos.reel * SYMBOL_SIZE + SYMBOL_SIZE / 2,
			y: (pos.row - 1) * SYMBOL_SIZE + SYMBOL_SIZE / 2,
		};
	}

	function startAbsorb(
		lPositions: { reel: number; row: number }[],
		ptPositions: { reel: number; row: number }[],
		segment: number,
	) {
		const color = SEGMENT_COLORS[Math.min(segment - 1, SEGMENT_COLORS.length - 1)];
		// Chalice position (first PT, or board center as fallback)
		const chalice =
			ptPositions.length > 0 ? posToPixel(ptPositions[0]) : { x: BOARD_SIZES.width / 2, y: BOARD_SIZES.height / 2 };

		const now = performance.now();
		const newOrbs: AbsorbOrb[] = [];
		let delay = 0;

		for (const pos of lPositions) {
			const origin = posToPixel(pos);

			// Burst direction: outward from chalice
			const dx = origin.x - chalice.x;
			const dy = origin.y - chalice.y;
			const dist = Math.sqrt(dx * dx + dy * dy) || 1;
			const burstDist = 60 + Math.random() * 80;
			const burstX = origin.x + (dx / dist) * burstDist;
			const burstY = origin.y + (dy / dist) * burstDist;

			// Orbit start: angle from chalice to burst endpoint
			const angleToChalice = Math.atan2(burstY - chalice.y, burstX - chalice.x);
			const orbitRadius = Math.sqrt(
				(burstX - chalice.x) * (burstX - chalice.x) +
					(burstY - chalice.y) * (burstY - chalice.y),
			);

			const orbStartTime = now + delay;

			newOrbs.push({
				id: nextId++,
				originX: origin.x,
				originY: origin.y,
				burstX,
				burstY,
				orbitStartAngle: angleToChalice,
				orbitStartRadius: orbitRadius,
				orbitRotations: 1.2 + Math.random() * 0.6,
				targetX: chalice.x,
				targetY: chalice.y,
				startTime: orbStartTime,
				burstEnd: orbStartTime + BURST_DURATION,
				orbitEnd: orbStartTime + BURST_DURATION + ORBIT_DURATION,
				currentX: origin.x,
				currentY: origin.y,
				currentAlpha: 0,
				currentScale: 1,
				color,
			});
			delay += ORB_STAGGER;
		}

		absorbOrbs = [...absorbOrbs, ...newOrbs];

		// Schedule chalice shake after all orbs converge
		const lastOrbEnd = now + delay + BURST_DURATION + ORBIT_DURATION;
		setTimeout(() => {
			chaliceShake = { active: true, baseX: chalice.x, baseY: chalice.y, offsetX: 0, offsetY: 0, startTime: performance.now() };

			// Schedule shoot to gauge after shake
			setTimeout(() => {
				chaliceShake = { ...chaliceShake, active: false, offsetX: 0, offsetY: 0 };
				spawnShootOrb(chalice.x, chalice.y, color);
			}, SHAKE_DURATION);
		}, lastOrbEnd - now);

		// Total animation duration
		const totalDuration = delay + BURST_DURATION + ORBIT_DURATION + SHAKE_DURATION + SHOOT_DURATION + 100;
		return totalDuration;
	}

	function spawnShootOrb(fromX: number, fromY: number, color: number) {
		const now = performance.now();
		// Curved path from chalice to gauge
		const midX = (fromX + GAUGE_CENTER_X) / 2;
		const midY = (fromY + GAUGE_CENTER_Y) / 2;
		const perpX = -(fromY - GAUGE_CENTER_Y);
		const perpY = fromX - GAUGE_CENTER_X;
		const pLen = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
		const arcAmount = 80 + Math.random() * 40;

		shootOrbs = [
			...shootOrbs,
			{
				id: nextId++,
				startX: fromX,
				startY: fromY,
				endX: GAUGE_CENTER_X,
				endY: GAUGE_CENTER_Y,
				cp1X: fromX + (GAUGE_CENTER_X - fromX) * 0.3 + (perpX / pLen) * arcAmount,
				cp1Y: fromY + (GAUGE_CENTER_Y - fromY) * 0.3 + (perpY / pLen) * arcAmount,
				cp2X: midX + (perpX / pLen) * arcAmount * 0.5,
				cp2Y: midY + (perpY / pLen) * arcAmount * 0.5,
				startTime: now,
				duration: SHOOT_DURATION,
				currentX: fromX,
				currentY: fromY,
				currentAlpha: 0,
				currentScale: 2.5,
				color,
			},
		];
	}

	function animate() {
		const now = performance.now();

		// Update absorb orbs (burst → orbit → absorb)
		for (const orb of absorbOrbs) {
			const elapsed = now - orb.startTime;
			if (elapsed < 0) continue;

			if (now < orb.burstEnd) {
				// Phase 1: Burst outward
				const t = easeOutCubic((now - orb.startTime) / BURST_DURATION);
				orb.currentX = orb.originX + (orb.burstX - orb.originX) * t;
				orb.currentY = orb.originY + (orb.burstY - orb.originY) * t;
				orb.currentAlpha = Math.min(elapsed / 100, 1);
				orb.currentScale = 1;
			} else if (now < orb.orbitEnd) {
				// Phase 2: Orbit/spiral toward chalice
				const orbitT = (now - orb.burstEnd) / ORBIT_DURATION;
				const easedT = easeInCubic(orbitT);

				// Spiral: angle increases, radius decreases
				const angle = orb.orbitStartAngle + orb.orbitRotations * orbitT * Math.PI * 2;
				const radius = orb.orbitStartRadius * (1 - easedT);

				orb.currentX = orb.targetX + Math.cos(angle) * radius;
				orb.currentY = orb.targetY + Math.sin(angle) * radius;
				orb.currentAlpha = 1;
				orb.currentScale = 1 - easedT * 0.5; // shrink as it spirals in
			} else {
				// Done — mark for removal
				orb.currentAlpha = 0;
			}
		}

		// Update shoot orbs (chalice → gauge)
		for (const orb of shootOrbs) {
			const elapsed = now - orb.startTime;
			if (elapsed < 0) continue;
			const t = Math.min(elapsed / orb.duration, 1);
			const et = easeInOutCubic(t);
			orb.currentX = cubicBezier(et, orb.startX, orb.cp1X, orb.cp2X, orb.endX);
			orb.currentY = cubicBezier(et, orb.startY, orb.cp1Y, orb.cp2Y, orb.endY);
			orb.currentAlpha = t < 0.08 ? t / 0.08 : t > 0.85 ? (1 - t) / 0.15 : 1;
			orb.currentScale = 2.5 - t * 1.5; // shrink from 2.5 to 1 as it reaches gauge
		}

		// Update chalice shake
		if (chaliceShake.active) {
			const shakeT = (now - chaliceShake.startTime) / SHAKE_DURATION;
			if (shakeT < 1) {
				const intensity = 4 * (1 - shakeT); // decays
				const freq = 30;
				chaliceShake.offsetX = Math.sin(shakeT * freq * Math.PI * 2) * intensity;
				chaliceShake.offsetY = Math.cos(shakeT * freq * Math.PI * 2.7) * intensity * 0.6;
			} else {
				chaliceShake.offsetX = 0;
				chaliceShake.offsetY = 0;
			}
		}

		// Cleanup expired orbs
		const aliveAbsorb = absorbOrbs.filter((o) => o.currentAlpha > 0);
		if (aliveAbsorb.length !== absorbOrbs.length) absorbOrbs = aliveAbsorb;

		const aliveShoot = shootOrbs.filter(
			(o) => now < o.startTime + o.duration,
		);
		if (aliveShoot.length !== shootOrbs.length) shootOrbs = aliveShoot;

		animFrame = requestAnimationFrame(animate);
	}

	context.eventEmitter.subscribeOnMount({
		chaliceAbsorbStart: (event) => {
			const duration = startAbsorb(event.lPositions, event.ptPositions, event.segment);
			// Return a promise that resolves when animation completes
			return new Promise<void>((resolve) => setTimeout(resolve, duration));
		},
	});

	onMount(() => {
		animFrame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animFrame);
	});
</script>

<BoardContainer>
	<!-- Absorb orbs (L symbols → orbit → chalice) -->
	{#each absorbOrbs as orb (orb.id)}
		<Graphics
			x={orb.currentX}
			y={orb.currentY}
			alpha={orb.currentAlpha}
			tint={orb.color}
			scale={{ x: orb.currentScale, y: orb.currentScale }}
			draw={(g) => {
				g.clear();
				g.beginFill(0xffffff, 0.25);
				g.drawCircle(0, 0, ORB_RADIUS * 2.5);
				g.endFill();
				g.beginFill(0xffffff, 0.7);
				g.drawCircle(0, 0, ORB_RADIUS);
				g.endFill();
				g.beginFill(0xffffff, 0.95);
				g.drawCircle(0, 0, ORB_RADIUS * 0.5);
				g.endFill();
			}}
		/>
	{/each}

	<!-- Shoot orb (chalice → gauge) — larger, brighter -->
	{#each shootOrbs as orb (orb.id)}
		<Graphics
			x={orb.currentX}
			y={orb.currentY}
			alpha={orb.currentAlpha}
			tint={orb.color}
			scale={{ x: orb.currentScale, y: orb.currentScale }}
			draw={(g) => {
				g.clear();
				g.beginFill(0xffffff, 0.15);
				g.drawCircle(0, 0, ORB_RADIUS * 4);
				g.endFill();
				g.beginFill(0xffffff, 0.5);
				g.drawCircle(0, 0, ORB_RADIUS * 2);
				g.endFill();
				g.beginFill(0xffffff, 0.95);
				g.drawCircle(0, 0, ORB_RADIUS);
				g.endFill();
			}}
		/>
	{/each}

	<!-- Chalice shake ring (visual pulse when absorb completes) -->
	{#if chaliceShake.active}
		{@const shakeT = Math.min(
			(performance.now() - chaliceShake.startTime) / SHAKE_DURATION,
			1,
		)}
		<Graphics
			x={chaliceShake.baseX + chaliceShake.offsetX}
			y={chaliceShake.baseY + chaliceShake.offsetY}
			alpha={0.6 * (1 - shakeT)}
			tint={0xff0000}
			scale={{ x: 1 + shakeT * 0.5, y: 1 + shakeT * 0.5 }}
			draw={(g) => {
				g.clear();
				g.lineStyle(2, 0xffffff, 0.8);
				g.drawCircle(0, 0, SYMBOL_SIZE * 0.4);
				g.endFill();
			}}
		/>
	{/if}
</BoardContainer>
