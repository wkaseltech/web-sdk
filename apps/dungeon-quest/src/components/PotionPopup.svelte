<script lang="ts" module>
	import type { Position } from '../game/types';

	export type EmitterEventPotionPopup = {
		type: 'potionPopupShow';
		positions: Position[];
	};
</script>

<script lang="ts">
	import { BitmapText, Container } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { SECOND } from 'constants-shared/time';
	import { waitForTimeout } from 'utils-shared/wait';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();

	type Popup = { x: number; y: number };
	let popups = $state<Popup[]>([]);
	let show = $state(false);

	context.eventEmitter.subscribeOnMount({
		potionPopupShow: async (event) => {
			popups = event.positions.map((pos) => ({
				x: pos.reel * SYMBOL_SIZE + SYMBOL_SIZE * 0.5,
				y: (pos.row - 1) * SYMBOL_SIZE + SYMBOL_SIZE * 0.5,
			}));
			show = true;
			await waitForTimeout(1.2 * SECOND);
			show = false;
			popups = [];
		},
	});
</script>

<FadeContainer {show} duration={0.3 * SECOND}>
	<BoardContainer>
		{#each popups as popup}
			<Container x={popup.x} y={popup.y}>
				<BitmapText
					anchor={0.5}
					y={-SYMBOL_SIZE * 0.3}
					text="+1 Spin"
					style={{
						fontFamily: 'gold',
						fontSize: SYMBOL_SIZE * 0.45,
					}}
				/>
			</Container>
		{/each}
	</BoardContainer>
</FadeContainer>
