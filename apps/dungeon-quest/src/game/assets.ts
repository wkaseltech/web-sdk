export default {
	// loader Spine removed — DQ uses Text-based loading screen instead of Mining Mayhem Spine
	pressToContinueText: {
		type: 'sprites',
		src: new URL('../../assets/sprites/pressToContinueText/MM_pressanywhere.json', import.meta.url).href,
		preload: true,
	},
	// Symbol sprites: H1=Lich H2=Dragon H3=Lizardman H4=Goblin L1=Skeleton L2=Spider L3=Bat SC=Key PT=Potion
	symbolLich: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/lich.png', import.meta.url).href,
	},
	symbolDragon: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/dragon.png', import.meta.url).href,
	},
	symbolLizardman: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/lizardman.png', import.meta.url).href,
	},
	symbolGoblin: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/goblin.png', import.meta.url).href,
	},
	symbolSkeleton: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/skeleton.png', import.meta.url).href,
	},
	symbolSpider: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/spider.png', import.meta.url).href,
	},
	symbolBat: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/bat.png', import.meta.url).href,
	},
	symbolKey: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/key.png', import.meta.url).href,
	},
	symbolPotion: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/symbols/potion.png', import.meta.url).href,
	},
	// Hero (single image for all poses)
	heroMain: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/hero/hero.png', import.meta.url).href,
	},
	// Board frame (skull frame surrounding reels)
	boardFrame: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/frame.png', import.meta.url).href,
	},
	// Door overlay (bonus transition)
	doorOverlay: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/door.png', import.meta.url).href,
	},
	// Backgrounds (same dungeon bg for both modes)
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
	// symbolsStatic removed — DQ loads individual symbol sprites instead of cluster's spritesheet
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
