<script lang="ts" module>
	export type EmitterEventHero = {
		type: 'heroStateChange';
		pose: 'idle' | 'level2' | 'bonus_stance' | 'boss_stance';
		level: number;
	};
</script>

<script lang="ts">
	import { Sprite, Container } from 'pixi-svelte';
	import { SECOND } from 'constants-shared/time';
	import { waitForTimeout } from 'utils-shared/wait';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, BOARD_SIZES } from '../game/constants';

	const context = getContext();

	const HERO_WIDTH = SYMBOL_SIZE * 1.8;
	const HERO_HEIGHT = SYMBOL_SIZE * 1.8;

	// Hero positioned tight to bottom-left of the board
	const heroPosition = $derived({
		x: -SYMBOL_SIZE * 0.5,
		y: BOARD_SIZES.height - SYMBOL_SIZE * 0.4,
	});

	context.eventEmitter.subscribeOnMount({
		heroStateChange: async () => {},
		winShow: async () => {},
	});
</script>

<Container
	x={heroPosition.x}
	y={heroPosition.y}
>
	<Sprite
		key="heroMain"
		width={HERO_WIDTH}
		height={HERO_HEIGHT}
		anchor={{ x: 0.5, y: 0 }}
	/>
</Container>
