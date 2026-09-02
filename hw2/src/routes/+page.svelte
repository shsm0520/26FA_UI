<svelte:head>
	<title>Hello World</title>
	<meta name="description" content="SvelteKit Hello World" />
</svelte:head>

<main class="hello-world">
	<h1>Hello World</h1>
	<p>SvelteKit + Vite setup is ready.</p>
</main>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		background: #f8fafc;
		color: #213547;
	}

	.hello-world {
		min-height: 100vh;
		display: grid;
		place-content: center;
		text-align: center;
		padding: 2rem;
	}

	h1 {
		margin: 0 0 0.75rem;
		font-size: clamp(2.5rem, 8vw, 5rem);
		color: #ff3e00;
	}

	p {
		margin: 0;
		font-size: 1.125rem;
		color: #475569;
	}
</style>
