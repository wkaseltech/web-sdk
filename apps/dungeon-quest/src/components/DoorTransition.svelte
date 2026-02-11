<script lang="ts" module>
	export type EmitterEventDoorTransition = { type: 'doorTransitionPlay' };
</script>

<script lang="ts">
	import { Sprite, Graphics } from 'pixi-svelte';
	import { CanvasSizeRectangle } from 'components-layout';
	import { waitForResolve } from 'utils-shared/wait';
	import { getContext } from '../game/context';

	const context = getContext();

	let active = $state(false);
	let oncomplete = $state(() => {});

	// Animation state
	let doorScale = $state(0.5);
	let doorAlpha = $state(0);
	let darkAlpha = $state(0);
	let slitWidth = $state(0);
	let slitGlow = $state(0);

	context.eventEmitter.subscribeOnMount({
		doorTransitionPlay: async () => {
			active = true;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});

	$effect(() => {
		if (!active) return;

		let animFrame: number;
		const startTime = performance.now();

		const animate = (now: number) => {
			const elapsed = now - startTime;
			const canvasW = context.stateLayoutDerived.canvasSizes().width;
			const canvasH = context.stateLayoutDerived.canvasSizes().height;

			if (elapsed < 600) {
				// Phase 1: Door zooms toward camera (0-600ms)
				const t = elapsed / 600;
				doorAlpha = Math.min(t * 2, 1);
				doorScale = 0.5 + t * 1.0;
				darkAlpha = t * 0.85;
				slitWidth = 0;
				slitGlow = 0;
			} else if (elapsed < 900) {
				// Phase 2: Fully dark, door fills screen (600-900ms)
				doorAlpha = 1;
				doorScale = 1.5;
				darkAlpha = 0.95;
				slitWidth = 0;
				slitGlow = 0;
			} else if (elapsed < 1100) {
				// Phase 3a: Bright vertical line appears at center (900-1100ms)
				const t = (elapsed - 900) / 200;
				slitWidth = 2 + t * 4;
				slitGlow = t;
				doorAlpha = 1;
				darkAlpha = 0.95;
			} else if (elapsed < 1800) {
				// Phase 3b: Slit expands to full width — door opening (1100-1800ms)
				const t = (elapsed - 1100) / 700;
				const eased = t * t; // ease-in for accelerating open
				slitWidth = 6 + eased * canvasW;
				slitGlow = 1 - t * 0.7;
				doorAlpha = 1 - t;
				darkAlpha = 0.95 * (1 - eased);
			} else {
				// Done
				active = false;
				doorAlpha = 0;
				darkAlpha = 0;
				slitWidth = 0;
				slitGlow = 0;
				oncomplete();
				return;
			}

			animFrame = requestAnimationFrame(animate);
		};

		animFrame = requestAnimationFrame(animate);

		return () => cancelAnimationFrame(animFrame);
	});
</script>

{#if active}
	{@const canvasW = context.stateLayoutDerived.canvasSizes().width}
	{@const canvasH = context.stateLayoutDerived.canvasSizes().height}

	<!-- Dark backdrop -->
	<CanvasSizeRectangle backgroundColor={0x000000} backgroundAlpha={darkAlpha} />

	<!-- Door image zooming in -->
	{#if doorAlpha > 0}
		<Sprite
			key="doorOverlay"
			anchor={0.5}
			x={canvasW * 0.5}
			y={canvasH * 0.5}
			height={canvasH * doorScale}
			alpha={doorAlpha}
		/>
	{/if}

	<!-- Bright vertical slit — the "opening" -->
	{#if slitWidth > 0}
		<Graphics
			draw={(g) => {
				g.clear();
				// Glowing center line
				g.beginFill(0xfff8e0, slitGlow * 0.9);
				g.drawRect(canvasW * 0.5 - slitWidth * 0.5, 0, slitWidth, canvasH);
				g.endFill();
				// Softer glow halo around the slit
				if (slitGlow > 0.2) {
					const haloW = slitWidth * 1.5;
					g.beginFill(0xfff8e0, slitGlow * 0.3);
					g.drawRect(canvasW * 0.5 - haloW * 0.5, 0, haloW, canvasH);
					g.endFill();
				}
			}}
		/>
	{/if}
{/if}
