export default {
	pressToContinueText: {
		type: 'sprites',
		src: new URL('../../assets/sprites/pressToContinueText/MM_pressanywhere.json', import.meta.url).href,
		preload: true,
	},
	// Symbol sprites: H1=Elder H2=Countess H3=Knight H4=Feral L1=Jack L2=Queen L3=King L4=Ace SC=Coffin PT=Chalice
	// High symbols — hungry (base) and fed (win) variants
	symbolElderHungry: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/elder_hungry.png', import.meta.url).href,
	},
	symbolElderFed: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/elder_fed.png', import.meta.url).href,
	},
	symbolCountessHungry: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/countess_hungry.png', import.meta.url).href,
	},
	symbolCountessFed: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/countess_fed.png', import.meta.url).href,
	},
	symbolKnightHungry: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/knight_hungry.png', import.meta.url).href,
	},
	symbolKnightFed: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/knight_fed.png', import.meta.url).href,
	},
	symbolFeralHungry: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/feral_hungry.png', import.meta.url).href,
	},
	symbolFeralFed: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/feral_fed.png', import.meta.url).href,
	},
	// Low symbols — full and empty variants
	symbolJackFull: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/jack_full.png', import.meta.url).href,
	},
	symbolJackEmpty: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/jack_empty.png', import.meta.url).href,
	},
	symbolQueenFull: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/queen_full.png', import.meta.url).href,
	},
	symbolQueenEmpty: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/queen_empty.png', import.meta.url).href,
	},
	symbolKingFull: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/king_full.png', import.meta.url).href,
	},
	symbolKingEmpty: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/king_empty.png', import.meta.url).href,
	},
	symbolAceFull: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/ace_full.png', import.meta.url).href,
	},
	symbolAceEmpty: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/ace_empty.png', import.meta.url).href,
	},
	// Special symbols
	symbolCoffin: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/coffin.png', import.meta.url).href,
	},
	symbolChalice: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/chalice.png', import.meta.url).href,
	},
	// Backgrounds (reuse bg for now — replace with vampire bg later)
	bgOverworld: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/backgrounds/bg.png', import.meta.url).href,
		preload: true,
	},
	bgBonus: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/backgrounds/bg.png', import.meta.url).href,
		preload: true,
	},
	// Reusable generic assets from cluster template
	explosion: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols3/symbols3.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols3/explosion.json', import.meta.url).href,
			scale: 2,
		},
	},
	reelsFrame: {
		type: 'sprites',
		src: new URL('../../assets/sprites/reelsFrame/reels_frame.json', import.meta.url).href,
	},
	payFrame: {
		type: 'sprite',
		src: new URL('../../assets/sprites/payFrame/payFrame.png', import.meta.url).href,
	},
	anticipation: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/anticipation/anticipation.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/anticipation/anticipation.json', import.meta.url).href,
			scale: 2,
		},
	},
	goldFont: {
		type: 'font',
		src: new URL('../../assets/fonts/goldFont/mm_gold.xml', import.meta.url).href,
	},
	goldBlur: {
		type: 'font',
		src: new URL('../../assets/fonts/goldBlur/miningfont_gold_blur.xml', import.meta.url).href,
	},
	silverFont: {
		type: 'font',
		src: new URL('../../assets/fonts/silverFont/mm_silver.xml', import.meta.url).href,
	},
	purpleFont: {
		type: 'font',
		src: new URL('../../assets/fonts/purpleFont/mm_purple.xml', import.meta.url).href,
	},
	bigwin: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/bigwin/big_wins.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/bigwin/mm_bigwin.json', import.meta.url).href,
			scale: 2,
		},
	},
	fsIntro: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_screen.json', import.meta.url).href,
			scale: 2,
		},
	},
	fsIntroNumber: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_screen_number.json', import.meta.url).href,
			scale: 2,
		},
	},
	fsOutroNumber: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_total_number.json', import.meta.url).href,
			scale: 2,
		},
	},
	tumble_multiplier: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/tumbleWin/tumble_win.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/tumbleWin/tumble_multiplier.json', import.meta.url).href,
			scale: 2,
		},
	},
	tumble_win: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/tumbleWin/tumble_win.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/tumbleWin/tumble_win.json', import.meta.url).href,
			scale: 2,
		},
	},
	reelhouse: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/reelhouse/reelhouse_glow.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/reelhouse/reelhouse_glow.json', import.meta.url).href,
			scale: 2,
		},
	},
	progressBar: {
		type: 'sprites',
		src: new URL('../../assets/sprites/progressBar/progressBar.json', import.meta.url).href,
		preload: true,
	},
	freeSpins: {
		type: 'sprites',
		src: new URL('../../assets/sprites/freeSpins/freeSpins.json', import.meta.url).href,
	},
	winSmall: {
		type: 'sprites',
		src: new URL('../../assets/sprites/winSmall/MM_Localisation_winsmall.json', import.meta.url).href,
	},
	clusterWin: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/clusterWin/clusterpay.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/clusterWin/clusterpay.json', import.meta.url).href,
			scale: 2,
		},
	},
	transition: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/transition/transition.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/transition/transition.json', import.meta.url).href,
			scale: 2,
		},
	},
	coins: {
		type: 'spriteSheet',
		src: new URL('../../assets/sprites/coin/SD2_Coin.json', import.meta.url).href,
	},
	sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sounds.json', import.meta.url).href,
		preload: true,
	},
} as const;
