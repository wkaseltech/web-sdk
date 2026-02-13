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
		spinHowl.fade(0, 1, 100, id);
		setTimeout(() => {
			if (spinHowl) {
				spinHowl.fade(1, 0, 100, id);
				setTimeout(() => spinHowl?.stop(id), 100);
			}
		}, 900);
	}

	// Standalone background music — loops with crossfade
	const bgmUrls: Record<string, string> = {
		bgm_main: new URL('../../static/assets/audio/bg.mp3', import.meta.url).href,
		bgm_freespin: new URL('../../static/assets/audio/bonus_bg.mp3', import.meta.url).href,
	};
	let activeBgm: Howl | null = null;
	let activeBgmName: string | null = null;

	function playBgm(name: string) {
		if (activeBgmName === name) return;
		const url = bgmUrls[name];
		if (!url) {
			// Fall back to sprite sheet for other music (win levels, boss, etc.)
			sound.players.music.play({ name: name as MusicName });
			return;
		}
		// Fade out current BGM
		if (activeBgm) {
			const old = activeBgm;
			old.fade(old.volume(), 0, 500);
			setTimeout(() => old.unload(), 600);
		}
		// Play new BGM
		activeBgm = new Howl({ src: [url], loop: true, volume: 0 });
		activeBgmName = name;
		activeBgm.play();
		activeBgm.fade(0, 0.6, 500);
	}

	context.eventEmitter.subscribeOnMount({
		// ui
		soundBetMode: async ({ betModeKey }) => {
			if (betModeKey === 'SUPERSPIN') {
				sound.players.once.play({ name: 'sfx_winlevel_end' });
				await waitForTimeout(SECOND);
				playBgm('bgm_freespin');
			} else {
				playBgm('bgm_main');
			}
		},
		soundPressGeneral: () => sound.players.once.play({ name: 'sfx_btn_general' }),
		soundPressBet: () => sound.players.once.play({ name: 'sfx_btn_spin' }),
		// scatterCounter
		soundScatterCounterIncrease: () => (context.stateGame.scatterCounter = context.stateGame.scatterCounter + 1), // prettier-ignore
		soundScatterCounterClear: () => (context.stateGame.scatterCounter = 0),
		// game
		soundMusic: ({ name }) => playBgm(name),
		soundLoop: ({ name }) => sound.players.loop.play({ name }),
		soundOnce: ({ name, forcePlay }) => sound.players.once.play({ name, forcePlay }),
		soundStop: ({ name }) => sound.stop({ name }),
		soundFade: async ({ name, duration, from, to }) => await sound.fade({ name, duration, from, to }), // prettier-ignore
		// spin sound (standalone mp3, 1s with fades)
		spinSoundPlay: () => playSpinSound(),
	});

	onMount(() => {
		if (stateBet.activeBetModeKey === 'SUPERSPIN') {
			playBgm('bgm_freespin');
		} else {
			playBgm('bgm_main');
		}

		return () => {
			if (spinHowl) {
				spinHowl.unload();
				spinHowl = null;
			}
			if (activeBgm) {
				activeBgm.unload();
				activeBgm = null;
				activeBgmName = null;
			}
		};
	});
</script>
