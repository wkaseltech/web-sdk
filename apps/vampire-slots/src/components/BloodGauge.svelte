<script lang="ts" module>
	export type EmitterEventBloodGauge =
		| { type: 'bloodGaugeShow' }
		| { type: 'bloodGaugeHide' }
		| {
				type: 'bloodGaugeUpdate';
				level: number;
				segment: number;
				multiplier: number;
		  };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { BitmapText, Container, Graphics } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, BOARD_SIZES } from '../game/constants';

	const context = getContext();

	let show = $state(true);
	let gaugeLevel = $state(0);
	let segment = $state(1);
	let multiplier = $state(1);

	// Position the gauge to the LEFT of the board frame
	const GAUGE_WIDTH = SYMBOL_SIZE * 0.4;
	const GAUGE_HEIGHT = BOARD_SIZES.height * 0.85;
	const FRAME_HALF_WIDTH = (BOARD_SIZES.width * 1.05) / 2;

	const GAUGE_X = -FRAME_HALF_WIDTH - GAUGE_WIDTH;
	const GAUGE_Y = -GAUGE_HEIGHT * 0.35;

	const MAX_FILL = GAUGE_HEIGHT - 4;

	// Segment colors: blood-red palette, intensifies with each segment
	const SEGMENT_COLORS: Record<number, { fill: number; flash: number }> = {
		1: { fill: 0x661111, flash: 0x882222 },
		2: { fill: 0x882222, flash: 0xaa3333 },
		3: { fill: 0xaa2222, flash: 0xcc3333 },
		4: { fill: 0xcc1111, flash: 0xee2222 },
		5: { fill: 0xff0000, flash: 0xff4444 },
	};

	// Animated fill state
	let fillScale = $state(0);
	let fillTint = $state(0x661111);
	let fillAlpha = $state(0.9);

	let targetScale = 0;
	let startScale = 0;
	let animStart = 0;
	let fillAnimFrame = 0;
	let flashTimeout = 0;

	const FILL_DURATION = 500;
	const FLASH_DURATION = 400;

	function easeOutCubic(t: number): number {
		return 1 - Math.pow(1 - t, 3);
	}

	function animateFill() {
		const elapsed = performance.now() - animStart;
		const t = Math.min(elapsed / FILL_DURATION, 1);
		fillScale = startScale + (targetScale - startScale) * easeOutCubic(t);
		if (t < 1) {
			fillAnimFrame = requestAnimationFrame(animateFill);
		}
	}

	function setTargetScale(value: number) {
		cancelAnimationFrame(fillAnimFrame);
		startScale = fillScale;
		targetScale = value;
		animStart = performance.now();
		fillAnimFrame = requestAnimationFrame(animateFill);
	}

	function getSegmentColor(seg: number): { fill: number; flash: number } {
		return SEGMENT_COLORS[Math.min(seg, 5)] ?? SEGMENT_COLORS[1];
	}

	function doSegmentFlash(newSegment: number, newLevel: number) {
		const prevColors = getSegmentColor(segment);
		fillTint = prevColors.flash;
		fillAlpha = 1.0;
		fillScale = fillScale; // keep current

		clearTimeout(flashTimeout);
		cancelAnimationFrame(fillAnimFrame);

		flashTimeout = window.setTimeout(() => {
			const newColors = getSegmentColor(newSegment);
			fillTint = newColors.fill;
			fillAlpha = 0.9;
			const progress = newLevel / 100;
			setTargetScale(Math.max(progress, 0.02));
		}, FLASH_DURATION);
	}

	context.eventEmitter.subscribeOnMount({
		bloodGaugeShow: () => {
			const colors = getSegmentColor(1);
			fillTint = colors.fill;
			fillAlpha = 0.9;
			fillScale = 0.02;
			targetScale = 0.02;
			startScale = 0.02;
		},
		bloodGaugeHide: () => {
			gaugeLevel = 0;
			segment = 1;
			multiplier = 1;
			fillScale = 0;
			targetScale = 0;
			startScale = 0;
			clearTimeout(flashTimeout);
			cancelAnimationFrame(fillAnimFrame);
		},
		bloodGaugeUpdate: (event) => {
			const oldSegment = segment;
			gaugeLevel = event.level;
			segment = event.segment;
			multiplier = event.multiplier;

			if (segment > oldSegment && oldSegment >= 1) {
				doSegmentFlash(segment, gaugeLevel);
			} else {
				const colors = getSegmentColor(segment);
				fillTint = colors.fill;
				fillAlpha = 0.9;
				const progress = gaugeLevel / 100;
				setTargetScale(Math.max(progress, 0.02));
			}
		},
	});

	onMount(() => {
		return () => {
			cancelAnimationFrame(fillAnimFrame);
			clearTimeout(flashTimeout);
		};
	});
</script>

<FadeContainer {show}>
	<BoardContainer>
		<Container x={GAUGE_X} y={GAUGE_Y}>
			<!-- Gauge background (vertical bar) -->
			<Graphics
				draw={(g) => {
					g.clear();
					g.lineStyle(1, 0x550000, 0.6);
					g.beginFill(0x110000, 0.9);
					g.drawRoundedRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT, 4);
					g.endFill();
					// Segment lines at 20%, 40%, 60%, 80%
					g.lineStyle(1, 0x550000, 0.4);
					for (let i = 1; i < 5; i++) {
						const y = GAUGE_HEIGHT * (1 - i * 0.2);
						g.moveTo(2, y);
						g.lineTo(GAUGE_WIDTH - 2, y);
					}
				}}
			/>
			<!-- Fill: grows upward from bottom -->
			<Graphics
				x={2}
				y={GAUGE_HEIGHT - 2}
				alpha={fillAlpha}
				tint={fillTint}
				scale={{ x: 1, y: fillScale * MAX_FILL }}
				draw={(g) => {
					g.clear();
					g.beginFill(0xffffff, 1);
					g.drawRect(0, -1, GAUGE_WIDTH - 4, 1);
					g.endFill();
				}}
			/>
			<!-- Multiplier text at top -->
			<BitmapText
				x={GAUGE_WIDTH * 0.5}
				y={-SYMBOL_SIZE * 0.25}
				anchor={{ x: 0.5, y: 0.5 }}
				text={`${multiplier}x`}
				style={{
					fontFamily: 'gold',
					fontSize: SYMBOL_SIZE * 0.35,
				}}
			/>
		</Container>
	</BoardContainer>
</FadeContainer>
