<script>
  import { onMount } from 'svelte'
  import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
  export let src
  export let title = 'PDF document'
  let container
  let canvas
  let pdf
  let pageNumber = 1
  let pageCount = 0
  let zoom = 1
  let busy = true
  let error = ''
  let renderTask
  let version = 0
  let destroyed = false
  async function render() {
    if (!pdf || destroyed) return
    const request = ++version
    busy = true
    const previous = renderTask
    previous?.cancel()
    try { await previous?.promise } catch {}
    if (request !== version || destroyed) return
    try {
      const page = await pdf.getPage(pageNumber)
      if (request !== version || destroyed) return
      const natural = page.getViewport({ scale: 1 })
      const width = Math.max(100, container.clientWidth - 32)
      const scale = width / natural.width * zoom
      const viewport = page.getViewport({ scale })
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.ceil(viewport.width * ratio)
      canvas.height = Math.ceil(viewport.height * ratio)
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`
      renderTask = page.render({ canvasContext: canvas.getContext('2d'), viewport, transform: [ratio, 0, 0, ratio, 0, 0] })
      await renderTask.promise
      if (request === version) error = ''
    } catch (cause) {
      if (cause.name !== 'RenderingCancelledException' && !destroyed) error = 'Unable to display this PDF.'
    } finally { if (request === version && !destroyed) busy = false }
  }
  function changePage(step) { pageNumber = Math.max(1, Math.min(pageCount, pageNumber + step)); render() }
  function changeZoom(step) { zoom = Math.max(.5, Math.min(2, Math.round((zoom + step) * 10) / 10)); render() }
  onMount(() => {
    let loading
    import('pdfjs-dist').then(({ getDocument, GlobalWorkerOptions }) => {
      if (destroyed) return
      GlobalWorkerOptions.workerSrc = workerUrl
      loading = getDocument({ url: src })
      return loading.promise
    }).then(document => { if (!destroyed && document) { pdf = document; pageCount = pdf.numPages; render() } }).catch(cause => { console.error('PDF load failed:', cause); if (!destroyed) { error = 'Unable to load this PDF.'; busy = false } })
    let lastWidth = 0
    const observer = new ResizeObserver(entries => { const width = entries[0].contentRect.width; if (width !== lastWidth) { lastWidth = width; render() } })
    observer.observe(container)
    return () => { destroyed = true; version++; observer.disconnect(); renderTask?.cancel(); loading?.destroy() }
  })
</script>
<div class="viewer" aria-label={title}>
  <div class="toolbar" aria-label="PDF controls">
    <button onclick={() => changePage(-1)} disabled={!pdf || pageNumber === 1} aria-label="Previous page">‹</button>
    <span aria-live="polite">{pageNumber} / {pageCount || '—'}</span>
    <button onclick={() => changePage(1)} disabled={!pdf || pageNumber === pageCount} aria-label="Next page">›</button>
    <div class="spacer"></div>
    <button onclick={() => changeZoom(-.1)} disabled={!pdf || zoom <= .5} aria-label="Zoom out">−</button>
    <span>{Math.round(zoom * 100)}%</span>
    <button onclick={() => changeZoom(.1)} disabled={!pdf || zoom >= 2} aria-label="Zoom in">+</button>
  </div>
  {#if error}<p role="alert">{error}</p>{:else if busy}<p class="loading" role="status">Loading PDF…</p>{/if}
  <div class="pages" bind:this={container} aria-busy={busy}>
    <canvas bind:this={canvas} aria-label={`${title}, page ${pageNumber} of ${pageCount}`}></canvas>
  </div>
</div>
<style>
.viewer { border: 1px solid #dfe6dc; border-radius: 10px; overflow: hidden; background: #eef1eb; }
.toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f7f9f4; border-bottom: 1px solid #dfe6dc; font-size: 12px; }
button { margin: 0; padding: 4px 10px; border: 1px solid #d4dece; border-radius: 6px; background: white; color: #355d40; font-size: 18px; cursor: pointer; }
button:disabled { opacity: .4; cursor: default; }
.spacer { flex: 1; }
.pages { overflow: auto; max-height: 75vh; padding: 16px; box-sizing: border-box; }
canvas { display: block; margin: 0 auto; background: white; }
p { padding: 10px 16px; }
.loading { margin: 0; font-size: 12px; }
</style>

