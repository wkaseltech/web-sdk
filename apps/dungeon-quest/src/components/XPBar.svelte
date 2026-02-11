<script lang="ts" module>
	export type EmitterEventXPBar =
		| { type: 'xpBarShow' }
		| { type: 'xpBarHide' }
		| {
				type: 'xpBarUpdate';
				level: number;
				multiplier: number;
				clusterCount: number;
				escalating: boolean;
		  };
</script>

<script lang="ts">
	import { BitmapText, Container, Graphics } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, BOARD_SIZES } from '../game/constants';

	const context = getContext();

	let show = $state(false);
	let level = $state(1);
	let multiplier = $state(1);
	let clusterCount = $state(0);
	let escalating = $state(false);

	const BAR_WIDTH = BOARD_SIZES.width;
	const BAR_HEIGHT = SYMBOL_SIZE * 0.35;
	const LEVEL_COLORS = [0x666666, 0x44aa44, 0x4488dd, 0xcc44cc, 0xff4444];

	// XP thresholds: cumulative cluster counts to reach each level
	const XP_THRESHOLDS = [0, 1, 3, 5, 8]; // index = level (1-indexed), value = clusters needed

	const barFillWidth = $derived(() => {
		if (level >= 5) return BAR_WIDTH - 4; // Level 5 (escalation) = full bar
		const currentThreshold = XP_THRESHOLDS[level - 1]; // clusters needed for current level
		const nextThreshold = XP_THRESHOLDS[level]; // clusters needed for next level
		const progress = (clusterCount - currentThreshold) / (nextThreshold - currentThreshold);
		return Math.max(0, Math.min(progress, 1)) * (BAR_WIDTH - 4);
	});

	const barColor = $derived(() => {
		return LEVEL_COLORS[Math.min(level - 1, LEVEL_COLORS.length - 1)];
	});

	context.eventEmitter.subscribeOnMount({
		xpBarShow: () => (show = true),
		xpBarHide: () => (show = false),
		xpBarUpdate: (event) => {
			level = event.level;
			multiplier = event.multiplier;
			clusterCount = event.clusterCount;
			escalating = event.escalating;
		},
	});
</script>

<FadeContainer {show}>
	<BoardContainer>
		<Container x={0} y={-SYMBOL_SIZE * 1.3}>
			<!-- Bar background -->
			<Graphics
				draw={(g) => {
					g.clear();
					g.beginFill(0x222222, 0.8);
					g.drawRoundedRect(0, 0, BAR_WIDTH, BAR_HEIGHT, 4);
					g.endFill();
				}}
			/>
			<!-- Bar fill -->
			<Graphics
				draw={(g) => {
					g.clear();
					g.beginFill(barColor(), 0.9);
					g.drawRoundedRect(2, 2, barFillWidth(), BAR_HEIGHT - 4, 3);
					g.endFill();
				}}
			/>
			<!-- Level text -->
			<BitmapText
				x={SYMBOL_SIZE * 0.15}
				y={BAR_HEIGHT * 0.5}
				anchor={{ x: 0, y: 0.5 }}
				text={`LV${level}`}
				style={{
					fontFamily: 'gold',
					fontSize: SYMBOL_SIZE * 0.4,
				}}
			/>
			<!-- Multiplier text -->
			<BitmapText
				x={BAR_WIDTH - SYMBOL_SIZE * 0.15}
				y={BAR_HEIGHT * 0.5}
				anchor={{ x: 1, y: 0.5 }}
				text={`${multiplier}x`}
				style={{
					fontFamily: 'gold',
					fontSize: SYMBOL_SIZE * 0.4,
				}}
			/>
		</Container>
	</BoardContainer>
</FadeContainer>
