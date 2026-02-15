<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { stateBet, stateConfig, stateUrlDerived } from 'state-shared';
	import { Authenticate } from 'components-shared';
	import { API_AMOUNT_MULTIPLIER, BOOK_AMOUNT_MULTIPLIER } from 'constants-shared/bet';

	type Props = { children: Snippet };

	const props: Props = $props();

	const hasRgsUrl = $derived(!!stateUrlDerived.rgsUrl());
	let devReady = $state(false);

	// ── Mock book types ──────────────────────────────────────────────
	type MockBook = {
		id: number;
		weight: number;
		payoutMultiplier: number;
		events: Record<string, unknown>[];
	};

	type MockBookData = {
		books: MockBook[];
		totalWeight: number;
	};

	let booksBase: MockBookData | null = null;
	let booksBonus: MockBookData | null = null;

	// Normalize raw JSON: accepts either {books, totalWeight} or a flat array
	function normalizeMockBooks(raw: unknown): MockBookData {
		if (Array.isArray(raw)) {
			// Flat array format — assign equal weight to each book
			const books = raw.map((b: any) => ({ ...b, weight: b.weight ?? 1 }));
			return { books, totalWeight: books.reduce((s: number, b: MockBook) => s + b.weight, 0) };
		}
		// Already in {books, totalWeight} format
		return raw as MockBookData;
	}

	// ── Weighted random book selection ───────────────────────────────
	function pickWeightedBook(data: MockBookData): MockBook {
		const rand = Math.random() * data.totalWeight;
		let cumulative = 0;
		for (const book of data.books) {
			cumulative += book.weight;
			if (rand < cumulative) return book;
		}
		return data.books[data.books.length - 1];
	}

	// ── Mock RGS ─────────────────────────────────────────────────────
	const MODE_COST: Record<string, number> = { BASE: 1, BONUS: 100 };

	let roundCounter = 0;
	let pendingPayoutUser = 0;

	function createMockBetResponse(requestBody: Record<string, unknown>) {
		roundCounter++;
		const mode = (requestBody?.mode as string) || 'BASE';
		const betAmountApi = (requestBody?.amount as number) || API_AMOUNT_MULTIPLIER;
		const betAmountUser = betAmountApi / API_AMOUNT_MULTIPLIER;

		// Pick a book from the appropriate set
		const bookData = mode === 'BONUS' ? booksBonus : booksBase;
		if (!bookData) {
			console.error('[VS DevMode] No book data loaded for mode:', mode);
			return createFallbackResponse(betAmountApi, betAmountUser, mode);
		}
		const book = pickWeightedBook(bookData);

		// Compute payout in API scale
		// payoutMultiplier is in BOOK_AMOUNT_MULTIPLIER (x100) scale, relative to base bet
		const modeCost = MODE_COST[mode] || 1;
		const baseBetApi = betAmountApi / modeCost;
		const payoutApi = (book.payoutMultiplier / BOOK_AMOUNT_MULTIPLIER) * baseBetApi;
		const payoutUser = payoutApi / API_AMOUNT_MULTIPLIER;

		// Deduct bet from balance; store pending payout for end-round
		const newBalanceUser = stateBet.balanceAmount - betAmountUser;
		pendingPayoutUser = payoutUser;

		console.info(
			`[VS DevMode] Book #${book.id} (${book.events.length} events) ` +
			`payout=${payoutUser.toFixed(2)} (${(book.payoutMultiplier / BOOK_AMOUNT_MULTIPLIER).toFixed(2)}x)`
		);

		return {
			status: { statusCode: 'SUCCESS', statusMessage: 'OK' },
			balance: {
				amount: newBalanceUser * API_AMOUNT_MULTIPLIER,
				currency: stateBet.currency,
			},
			round: {
				roundID: roundCounter,
				amount: betAmountApi,
				payout: payoutApi,
				payoutMultiplier: book.payoutMultiplier / BOOK_AMOUNT_MULTIPLIER,
				active: false,
				mode,
				event: '0',
				state: book.events,
			},
		};
	}

	function createFallbackResponse(betAmountApi: number, betAmountUser: number, mode: string) {
		const newBalanceUser = stateBet.balanceAmount - betAmountUser;
		pendingPayoutUser = 0;
		return {
			status: { statusCode: 'SUCCESS', statusMessage: 'OK' },
			balance: {
				amount: newBalanceUser * API_AMOUNT_MULTIPLIER,
				currency: stateBet.currency,
			},
			round: {
				roundID: roundCounter,
				amount: betAmountApi,
				payout: 0,
				payoutMultiplier: 0,
				active: false,
				mode,
				event: '0',
				state: [
					{ index: 0, type: 'setTotalWin', amount: 0 },
					{ index: 1, type: 'finalWin', amount: 0 },
				],
			},
		};
	}

	function createMockEndRoundResponse() {
		// Add pending payout to balance
		const newBalanceUser = stateBet.balanceAmount + pendingPayoutUser;
		pendingPayoutUser = 0;
		return {
			status: { statusCode: 'SUCCESS', statusMessage: 'OK' },
			balance: {
				amount: newBalanceUser * API_AMOUNT_MULTIPLIER,
				currency: stateBet.currency,
			},
		};
	}

	// ── Setup ─────────────────────────────────────────────────────────
	onMount(async () => {
		if (!hasRgsUrl) {
			// Load mock book data from static assets
			const [baseRes, bonusRes] = await Promise.all([
				fetch('/mockBooks/mock_books_base.json'),
				fetch('/mockBooks/mock_books_bonus.json'),
			]);
			booksBase = normalizeMockBooks(await baseRes.json());
			booksBonus = normalizeMockBooks(await bonusRes.json());

			// Seed mock state so the game renders without an RGS backend
			stateBet.currency = 'USD';
			stateBet.balanceAmount = 20;
			stateBet.betAmount = 1;
			stateConfig.betAmountOptions = [0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100];
			stateConfig.betMenuOptions = [0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100];

			// Intercept fetch calls to mock RGS endpoints
			const originalFetch = window.fetch;
			window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
				const url =
					typeof input === 'string'
						? input
						: input instanceof Request
							? input.url
							: input.toString();

				if (url.includes('/wallet/play')) {
					const body = init?.body ? JSON.parse(init.body as string) : {};
					const mock = createMockBetResponse(body);
					console.info('[VS DevMode] /wallet/play response:', mock);
					return new Response(JSON.stringify(mock), {
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					});
				}

				if (url.includes('/wallet/end-round')) {
					const mock = createMockEndRoundResponse();
					return new Response(JSON.stringify(mock), {
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					});
				}

				if (url.includes('/bet/event')) {
					return new Response(JSON.stringify({ status: { statusCode: 'SUCCESS' } }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					});
				}

				return originalFetch(input as RequestInfo, init);
			};

			devReady = true;
			const deadCount = booksBase!.books.filter((b) => b.payoutMultiplier === 0).length;
			const deadWeight = booksBase!.books
				.filter((b) => b.payoutMultiplier === 0)
				.reduce((s, b) => s + b.weight, 0);
			console.info(
				`[VS DevMode] Mock RGS loaded: ${booksBase!.books.length} base + ` +
				`${booksBonus!.books.length} bonus books. ` +
				`Dead: ${deadCount} books (${((deadWeight / booksBase!.totalWeight) * 100).toFixed(1)}% by weight). ` +
				`totalWeight=${booksBase!.totalWeight}. ` +
				`Pass ?rgs_url=... to connect to a real RGS.`
			);
		}
	});
</script>

{#if hasRgsUrl}
	<!-- Real RGS mode: delegate to the shared Authenticate component -->
	<Authenticate>
		{@render props.children()}
	</Authenticate>
{:else if devReady}
	<!-- Dev mode: skip auth, render game immediately with mock data -->
	{@render props.children()}
{/if}
