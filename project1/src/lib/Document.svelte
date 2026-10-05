<script>
  import { onMount } from 'svelte'
  import PdfViewer from './common/PdfViewer.svelte'
  import VideoPlayer from './common/VideoPlayer.svelte'

  const base = `${import.meta.env.BASE_URL}documents/`
  const sketchUrl = `${base}project1-sketch.pdf`
  // Place these files in public/documents to publish the media sections.
  const videoUrl = `${base}demo.mp4`
  const slidesUrl = `${base}presentation.pdf`
  const examplePdfUrl = `${base}example.pdf`
  let hasVideo = false
  let hasSlides = false
  let hasExamplePdf = false
  let activeSection = 'doc-overview'
  let pageTop
  let contents = []
  let documentBody
  let navigationTarget = null
  let navigationFrame = 0
  function scrollToPosition(top) {
    cancelAnimationFrame(navigationFrame)
    // Stop any browser-owned smooth scroll before starting the newest request.
    window.scrollTo({ top: window.scrollY, behavior: 'instant' })
    const start = window.scrollY
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const destination = Math.max(0, Math.min(top, max))
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: destination, behavior: 'instant' })
      return
    }
    const started = performance.now()
    function animate(now) {
      const progress = Math.min(1, (now - started) / 320)
      const eased = 1 - Math.pow(1 - progress, 3)
      window.scrollTo({ top: start + (destination - start) * eased, behavior: 'instant' })
      navigationFrame = progress < 1 ? requestAnimationFrame(animate) : 0
    }
    navigationFrame = requestAnimationFrame(animate)
  }

  function goTo(id) {
    navigationTarget = id
    activeSection = id
    const heading = document.getElementById(id)
    heading?.focus({ preventScroll: true })
    if (heading) scrollToPosition(window.scrollY + heading.getBoundingClientRect().top - 24)
  }
  function toTop() {
    navigationTarget = contents[0]?.id ?? null
    activeSection = navigationTarget
    pageTop?.focus({ preventScroll: true })
    scrollToPosition(0)
  }
  onMount(() => {
    const controller = new AbortController()
    async function exists(url, type) {
      try {
        const response = await fetch(url, { method: 'HEAD', signal: controller.signal })
        return response.ok && (response.headers.get('content-type') || '').includes(type)
      } catch { return false }
    }
    exists(videoUrl, 'video/').then(value => { hasVideo = value })
    exists(slidesUrl, 'application/pdf').then(value => { hasSlides = value })
    exists(examplePdfUrl, 'application/pdf').then(value => { hasExamplePdf = value })
    let headings = []
    let frame = 0
    function syncActiveSection() {
      frame = 0
      if (navigationTarget || !headings.length) return
      const scrollRoot = document.scrollingElement || document.documentElement
      const canScroll = scrollRoot.scrollHeight > window.innerHeight + 2
      if (canScroll && window.scrollY + window.innerHeight >= scrollRoot.scrollHeight - 4) {
        activeSection = headings[headings.length - 1].id
        return
      }
      let current = headings[0]
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 40) current = heading
        else break
      }
      activeSection = current.id
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(syncActiveSection)
    }
    function releaseNavigation(event) {
      // Pressing another TOC link must not briefly select the old scroll position.
      if ((event.type === 'pointerdown' || event.type === 'touchstart') && event.target instanceof Element && event.target.closest('.toc, .back-to-top')) return
      if (event.type === 'keydown' && !['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return
      cancelAnimationFrame(navigationFrame)
      navigationFrame = 0
      navigationTarget = null
      onScroll()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('wheel', releaseNavigation, { passive: true })
    window.addEventListener('touchstart', releaseNavigation, { passive: true })
    window.addEventListener('pointerdown', releaseNavigation)
    window.addEventListener('keydown', releaseNavigation)
    function refreshContents() {
      headings = [...documentBody.querySelectorAll('h3')]
      const usedIds = new Set()
      contents = headings.map((heading, index) => {
        let id = heading.id || `doc-section-${index + 1}`
        while (usedIds.has(id)) id += '-section'
        usedIds.add(id)
        if (heading.id !== id) heading.id = id
        if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1
        return { id, title: heading.textContent.trim() }
      })
      if (navigationTarget && !headings.some(heading => heading.id === navigationTarget)) navigationTarget = null
      onScroll()
    }
    refreshContents()
    const mutations = new MutationObserver(refreshContents)
    mutations.observe(documentBody, { childList: true, subtree: true, characterData: true })
    return () => {
      controller.abort()
      mutations.disconnect()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(navigationFrame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('wheel', releaseNavigation)
      window.removeEventListener('touchstart', releaseNavigation)
      window.removeEventListener('pointerdown', releaseNavigation)
      window.removeEventListener('keydown', releaseNavigation)
    }
  })
</script>

<div class="documentation">
  <aside class="toc">
    <span class="eyebrow">PROJECT 1</span>
    <h2>Table of Contents</h2>
    <nav aria-label="Table of Contents">
      {#each contents as item, index}
        <a href={`#${item.id}`} class:active={activeSection === item.id} aria-current={activeSection === item.id ? 'location' : undefined} onclick={(event) => { event.preventDefault(); goTo(item.id) }}><span>0{index + 1}</span>{item.title}</a>
      {/each}
    </nav>
  </aside>

  <div class="document-body" bind:this={documentBody}>
    <header>
      <span class="eyebrow">DESIGN & DOCUMENTATION</span>
      <h2 bind:this={pageTop} tabindex="-1">Smart Planter</h2>
      <p>Design sketches, a demonstration, and presentation materials.</p>
    </header>
    <section aria-labelledby="doc-overview">
      <h3 id="doc-overview" tabindex="-1">Overview</h3>
      <p>A smart planter concept with an adjustable inner pod, status LEDs, physical controls, and a companion mobile interface.</p>
      <p>This page brings together the project's design and demonstration materials.</p>
    </section>

    <section aria-labelledby="doc-pdf-physical-affordances">
      <div class="section-heading">
        <h3 id="doc-pdf-physical-affordances" tabindex="-1">Physical Affordances</h3>
      </div>
      <p>A placeholder for an additional project document.</p>
      <ul>
        <li>
        Double Pod Mechanism
        </li>
        <li>
        Multi-Surface Control & Display Integration
        </li>
        <li>
        Status LED Indicator
        </li>
      </ul>
    </section>

        <section aria-labelledby="doc-pdf-User-Needs-Gathering-Interviews">
      <div class="section-heading">
        <h3 id="doc-user-needs" tabindex="-1">User Needs Gathering & Interviews</h3>
      </div>
      <p>A placeholder for an additional project document.</p>
      <ul>
        <li>
        Double Pod Mechanism
        </li>
        <li>
        Multi-Surface Control & Display Integration
        </li>
        <li>
        Status LED Indicator
        </li>
      </ul>
    </section>

    <section aria-labelledby="doc-sketch">
      <div class="section-heading"><h3 id="doc-sketch" tabindex="-1">Design sketch</h3></div>
      <p>Initial vanilla sketch: the planter structure and companion interface.</p>
      <PdfViewer src={sketchUrl} title="Initial planter sketch" />
    </section>

    <section aria-labelledby="doc-video">
      <h3 id="doc-video" tabindex="-1">Demo video</h3>
      {#if hasVideo}
        <VideoPlayer src={videoUrl} />
      {:else}
        <div class="media-placeholder"><span aria-hidden="true">▷</span><strong>Demo video coming soon</strong><p>The project demonstration will appear here.</p></div>
      {/if}
    </section>

    <section aria-labelledby="doc-presentation">
      <div class="section-heading"><h3 id="doc-presentation" tabindex="-1">Presentation</h3></div>
      {#if hasSlides}
        <PdfViewer src={slidesUrl} title="Presentation slides" />
      {:else}
        <div class="media-placeholder"><span aria-hidden="true">▤</span><strong>Presentation preview coming soon</strong><p>The presentation PDF will appear here when it is ready.</p></div>
      {/if}
    </section>

    <!-- Copy this section and update its title, unique heading ID, URL and availability check for another PDF. -->
    <section aria-labelledby="doc-pdf-example">
      <div class="section-heading">
        <h3 id="doc-pdf-example" tabindex="-1">PDF example</h3>
      </div>
      <p>A placeholder for an additional project document.</p>
      {#if hasExamplePdf}
        <PdfViewer src={examplePdfUrl} title="Example PDF" />
      {:else}
        <div class="media-placeholder"><span aria-hidden="true">▤</span><strong>PDF document coming soon</strong><p>The document preview will appear here.</p></div>
      {/if}
    </section>

  </div>
</div>
<button class="back-to-top" onclick={toTop} aria-label="Back to top" title="Back to top">↑ <span>Top</span></button>

<style>
  .documentation { display: grid; grid-template-columns: 230px minmax(0, 1fr); gap: 40px; align-items: start; color: #2c4135; }
  .toc { position: sticky; top: 24px; padding: 22px 16px; border: 1px solid #dfe6dc; border-radius: 14px; background: #f6f8f2; }
  .eyebrow { font-size: 10px; font-weight: bold; letter-spacing: 1.5px; color: #788574; }
  .toc h2 { font-size: 17px; margin: 14px 0 20px; }
  nav { display: grid; gap: 6px; }
  nav a { display: flex; gap: 12px; padding: 12px 10px; border-radius: 7px; text-decoration: none; font-size: 13px; }
  nav a span { color: #8a9784; font-size: 11px; }
  nav a:hover { background: #f0f4ec; }
  nav a.active { background: #e3ecdc; color: #244f32; }
  a { color: #386b46; }
  .document-body { min-width: 0; padding-bottom: 64px; }
  header { padding: 18px 0 24px; }
  header h2 { font-size: 36px; margin: 12px 0; }
  p { font-size: 14px; color: #69756b; line-height: 1.8; }
  section { padding: 24px; margin-bottom: 28px; border: 1px solid #dfe6dc; border-radius: 14px; }
  h3 { font-size: 23px; margin: 0 0 14px; scroll-margin-top: 24px; }
  h2:focus, h3:focus { outline: none; }
  .section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .media-placeholder { min-height: 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: #f5f7f1; border: 1px dashed #cbd6c4; border-radius: 10px; padding: 20px; }
  .media-placeholder > span { font-size: 36px; color: #879b7f; margin-bottom: 14px; }
  .back-to-top { position: fixed; right: 24px; bottom: 24px; z-index: 30; display: flex; gap: 8px; align-items: center; margin: 0; padding: 13px 18px; border: 0; border-radius: 30px; background: #355d40; color: white; box-shadow: 0 5px 20px #172a2533; cursor: pointer; }
  .back-to-top:hover { background: #244b30; }
  @media (max-width: 760px) { .documentation { grid-template-columns: 1fr; gap: 20px; } .toc { position: static; } nav { grid-template-columns: 1fr 1fr; } section { padding: 16px; } header h2 { font-size: 28px; } .back-to-top { right: 16px; bottom: 16px; } }
</style>
