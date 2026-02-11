<script lang="ts" module>
	import { sound, type MusicName, type SoundEffectName, type SoundName } from '../game/sound';

	export type EmitterEventSound =
		| { type: 'soundMusic'; name: MusicName }
		| { type: 'soundOnce'; name: SoundEffectName; forcePlay?: boolean }
		| { type: 'soundLoop'; name: SoundEffectName }
		| { type: 'soundStop'; name: SoundName }
		| { type: 'soundFade'; name: SoundName; from: number; to: number; duration: number }
		| { type: 'soundScatterCounterIncrease' }
		| { type: 'soundScatterCounterClear' }
		| { type: 'spinSoundPlay' };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Howl } from 'howler';

	import { waitForTimeout } from 'utils-shared/wait';
	import { SECOND } from 'constants-shared/time';
	import { stateBet } from 'state-shared';

	import { getContext } from '../game/context';

	const context = getContext();

	// Standalone spin sound — plays 1s with 0.1s fade in/out
	const spinSoundUrl = new URL('../../static/assets/audio/spin.mp3', import.meta.url).href;
	let spinHowl: Howl | null = null;

	function playSpinSound() {
		if (!spinHowl) {
			spinHowl = new Howl({ src: [spinSoundUrl], volume: 0 });
		}
		const id = spinHowl.play();
		// Fade in over 100ms
		spinHowl.fade(0, 1, 100, id);
		// At 900ms, fade out over 100ms, then stop at 1000ms
		setTimeout(() => {
			if (spinHowl) {
				spinHowl.fade(1, 0, 100, id);
				setTimeout(() => spinHowl?.stop(id), 100);
			}
		}, 900);
	}

	context.eventEmitter.subscribeOnMount({
		// ui
		soundBetMode: async ({ betModeKey }) => {
			if (betModeKey === 'SUPERSPIN') {
				// check if SUPERSPIN, when changing the bet mode.
				sound.players.once.play({ name: 'sfx_winlevel_end' });
				await waitForTimeout(SECOND);
				sound.players.music.play({ name: 'bgm_freespin' });
			} else {
				sound.players.music.play({ name: 'bgm_main' });
			}
		},
		soundPressGeneral: () => sound.players.once.play({ name: 'sfx_btn_general' }),
		soundPressBet: () => sound.players.once.play({ name: 'sfx_btn_spin' }),
		// scatterCounter
		soundScatterCounterIncrease: () => (context.stateGame.scatterCounter = context.stateGame.scatterCounter + 1), // prettier-ignore
		soundScatterCounterClear: () => (context.stateGame.scatterCounter = 0),
		// game
		soundMusic: ({ name }) => sound.players.music.play({ name }),
		soundLoop: ({ name }) => sound.players.loop.play({ name }),
		soundOnce: ({ name, forcePlay }) => sound.players.once.play({ name, forcePlay }),
		soundStop: ({ name }) => sound.stop({ name }),
		soundFade: async ({ name, duration, from, to }) => await sound.fade({ name, duration, from, to }), // prettier-ignore
		// spin sound (standalone mp3, 1s with fades)
		spinSoundPlay: () => playSpinSound(),
	});

	onMount(() => {
		if (stateBet.activeBetModeKey === 'SUPERSPIN') {
			// check if SUPERSPIN, when resume bet and the bet is a super spin.
			sound.players.music.play({ name: 'bgm_freespin' });
		} else {
			sound.players.music.play({ name: 'bgm_main' });

			//How to control volume per soundfile(use fade)
			// sound.players.music.fade({ name: 'bgm_main', from: 0, to: 1, duration: 3000 });

			//How to control rate per soundfile
			// sound.players.music.rate({ rate: 2, name: 'bgm_main'}); // change play back rate(1: default, 0: slow, 1+ fasterm and higher pitch )
		}

		return () => {
			if (spinHowl) {
				spinHowl.unload();
				spinHowl = null;
			}
		};
	});
</script>
