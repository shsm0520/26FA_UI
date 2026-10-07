<script>
  import { onMount } from 'svelte'
  import PdfViewer from './common/PdfViewer.svelte'
  import VideoPlayer from './common/VideoPlayer.svelte'

  const base = `${import.meta.env.BASE_URL}documents/`
  const sketchUrl = `${base}project1-sketch.pdf`
  // Place these files in public/documents to publish the media sections.
  const videoUrl = `${base}demo.mp4?v=319a284`
  const slidesUrl = `${base}presentation.pdf`
  const designMedia = [
    { title: '10 Minute Sketches', file: 'rapid-sketches.pdf', description: 'Alternatives for three challenges: feedback about water shortages, cup height adjustment, and the management interface. Highlighted ideas include a simple rim LED, phone notifications, a linear motion mechanism, and physical buttons alongside the phone UI.' },
    { title: 'Hybrid sketch', file: 'hybrid-sketch.pdf', description: 'A real planter photograph annotated with a rim LED, soil sensor, inner pod, water reservoir, and movement mechanism. The drawing explores how these elements fit into the physical object. The final prototype also includes side mounted Automatic Care and Maintenance buttons, which are not shown in this sketch.' },
  ]
  let availableDesignMedia = {}
  let hasVideo = false
  let hasSlides = false
  let activeSection = 'doc-overview'
  let pageTop
  let contents = []
  let documentBody
  let navigationTarget = null
  let navigationFrame = 0
  let navigatingTop = false
  function destinationFor(top) {
    const heading = !navigatingTop && navigationTarget ? document.getElementById(navigationTarget) : null
    const requested = heading ? window.scrollY + heading.getBoundingClientRect().top - 24 : top
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    return Math.max(0, Math.min(requested, max))
  }
  function scrollToPosition(top) {
    cancelAnimationFrame(navigationFrame)
    // Stop any browser-owned smooth scroll before starting the newest request.
    window.scrollTo({ top: window.scrollY, behavior: 'instant' })
    const start = window.scrollY
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: destinationFor(top), behavior: 'instant' })
      return
    }
    const started = performance.now()
    function animate(now) {
      const progress = Math.min(1, (now - started) / 320)
      const eased = 1 - Math.pow(1 - progress, 3)
      window.scrollTo({ top: start + (destinationFor(top) - start) * eased, behavior: 'instant' })
      navigationFrame = progress < 1 ? requestAnimationFrame(animate) : 0
    }
    navigationFrame = requestAnimationFrame(animate)
  }

  function goTo(id) {
    navigatingTop = false
    navigationTarget = id
    activeSection = id
    const heading = document.getElementById(id)
    heading?.focus({ preventScroll: true })
    if (heading) scrollToPosition(window.scrollY + heading.getBoundingClientRect().top - 24)
  }
  function toTop() {
    navigatingTop = true
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
    for (const media of designMedia) exists(`${base}${media.file}`, 'application/pdf').then(value => { availableDesignMedia = { ...availableDesignMedia, [media.file]: value } })
    exists(videoUrl, 'video/').then(value => { hasVideo = value })
    exists(slidesUrl, 'application/pdf').then(value => { hasSlides = value })
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
    // PDFs and images can change section positions after a TOC click.
    // Keep the selected heading aligned until the user starts navigating manually.
    const layoutObserver = new ResizeObserver(() => {
      if (navigationTarget && !navigationFrame) {
        window.scrollTo({ top: destinationFor(0), behavior: 'instant' })
      }
    })
    layoutObserver.observe(documentBody)
    const mutations = new MutationObserver(refreshContents)
    mutations.observe(documentBody, { childList: true, subtree: true, characterData: true })
    return () => {
      controller.abort()
      mutations.disconnect()
      layoutObserver.disconnect()
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
        <a href={`#${item.id}`} class:active={activeSection === item.id} aria-current={activeSection === item.id ? 'location' : undefined} onclick={(event) => { event.preventDefault(); goTo(item.id) }}><span>{String(index + 1).padStart(2, '0')}</span>{item.title}</a>
      {/each}
    </nav>
  </aside>

  <div class="document-body" bind:this={documentBody}>
    <header>
      <span class="eyebrow">DESIGN & DOCUMENTATION</span>
      <h2 bind:this={pageTop} tabindex="-1">Smart Planter</h2>
      <p>Seunghun Lee · An interactive physical object and mobile interface prototype.</p>
    </header>
    <section aria-labelledby="doc-overview">
      <h3 id="doc-overview" tabindex="-1">Overview</h3>
      <p>Smart Planter explores how a planter can communicate its condition and help a user manage watering. An adjustable inner pod changes its position relative to the water reservoir. A rim LED gives status at a glance, two side buttons support direct interaction, and a companion phone provides readings and preferences.</p>
      <p>The Starter page separates the physical object concept, the mobile interface, and simulation controls. The cutaway makes internal movement visible for demonstration; it does not represent a transparent production enclosure.</p>
      <p><a href={import.meta.env.BASE_URL}>Open project home</a> · <a href="https://github.com/shsm0520/26FA_UI" target="_blank" rel="noreferrer">View source on GitHub ↗</a></p>
      <p><strong>Implemented extensions:</strong> Option 2: a mock secondary device, and Option 4: simulation over time. The phone and planter share state; accelerated time changes water, moisture, pod position, and alerts.</p>
    </section>

    <section aria-labelledby="doc-pdf-physical-affordances">
      <h3 id="doc-pdf-physical-affordances" tabindex="-1">Physical Affordances</h3>
      <p>The concept is a freestanding planter intended for a stable indoor surface. Its open top gives access to the plant and inner pod. The outer container holds a reservoir while the inner pod supports the plant and soil. Raising the pod creates access for maintenance.</p>
      <ul>
        <li><strong>Double pod structure:</strong> vertical movement changes the inner pod's relationship to the water, while the outer body stays stationary.</li>
        <li><strong>Top rim:</strong> a visible light communicates normal, warning, and maintenance states without opening the phone.</li>
        <li><strong>Side surface:</strong> separate Automatic Care and Maintenance buttons make the two actions available at the object.</li>
        <li><strong>Signifiers and feedback:</strong> labels identify the buttons; illumination and pod movement show the resulting state. The interface spans the rim and side rather than a single flat control surface.</li>
      </ul>
    </section>

    <section aria-labelledby="doc-user-needs">
      <h3 id="doc-user-needs" tabindex="-1">User Needs & Design Changes</h3>
      <p><strong>Revision after interviews:</strong> after user interviews, physical buttons were added to the planter body. The resulting design supports Automatic Care and Maintenance directly on the object, as well as through the companion app. This change reduces the steps needed to reach these actions while standing beside the planter.</p>
      <p class="editor-note">Research record to complete: add the anonymized notes from the three interviews and feedback from the three reviewers of the vanilla sketch. The confirmed design change is documented above; participant statements are not reconstructed here.</p>
      <div class="table-wrap"><table><thead><tr><th>User need / design goal</th><th>Interface response</th></tr></thead><tbody>
        <tr><td>Recognize when attention is needed</td><td>Rim status light, warning cards for each cause, and optional mobile banners.</td></tr>
        <tr><td>Adjust the desired moisture level</td><td>A target slider shared between phone settings and the test panel.</td></tr>
        <tr><td>Reach routine controls beside the plant</td><td>Physical Automatic Care and Maintenance buttons.</td></tr>
        <tr><td>Access the inner pod for maintenance</td><td>Raise the pod to maximum height and suspend automatic movement until maintenance ends.</td></tr>
        <tr><td>Choose how the object communicates</td><td>Independent rim light, button light, and notification settings.</td></tr>
      </tbody></table></div>
      <p>These requirements describe the implemented design goals; they are not presented as quotations from participants.</p>
    </section>

    <section aria-labelledby="doc-assumptions">
      <h3 id="doc-assumptions" tabindex="-1">Smart Features & Assumptions</h3>
      <p>A future physical version would sense reservoir level, soil moisture, and temperature, and use a powered mechanism to adjust pod height. The prototype assumes these readings and controls are available. Their engineering feasibility and watering performance still require physical testing.</p>
      <p>All readings are simulated. Pairing is a mock flow, temperature remains at a demonstration value of 24°C, and Plant Food / Needed is a static indicator. Plant presets and displayed ranges illustrate the interface rather than horticultural recommendations. The application controls one registered planter at a time and does not preserve setup after a page reload.</p>
      <p>The phone supplies detailed readings, naming, plant selection, and preferences without adding a large screen to the planter. The body controls still support direct use without pairing the phone.</p>
    </section>

    <section aria-labelledby="doc-sketch">
      <div class="section-heading"><h3 id="doc-sketch" tabindex="-1">Design sketch</h3></div>
      <p>Initial vanilla sketch: the planter structure and companion interface.</p>
      <PdfViewer src={sketchUrl} title="Initial planter sketch" />
    </section>

    {#each designMedia as media}
      <section>
        <h3>{media.title}</h3>
        <p>{media.description}</p>
        {#if availableDesignMedia[media.file]}
          <PdfViewer src={`${base}${media.file}`} title={media.title} />
        {:else}
          <div class="media-placeholder"><span aria-hidden="true">▤</span><strong>Sketch to be added</strong><p>The original drawing will be presented here.</p></div>
        {/if}
      </section>
    {/each}

    <section aria-labelledby="doc-interface">
      <h3 id="doc-interface" tabindex="-1">Interface & Controls</h3>
      <h4>Register and personalize</h4>
      <p>Choose Add planter, enter a name, connect the mock device, and select Monstera, Basil, or Succulent. Each plant starts with a demo moisture target. The home card opens the planter; small edit and delete icons keep secondary actions within the card. Deletion asks for confirmation inside the phone.</p>
      <h4>Monitor and manage</h4>
      <p>The main phone screen displays water level, soil moisture, temperature, and plant food status. Details reveals the target moisture and cup height. Settings supports renaming, changing plant and moisture target, independent lighting options, water and dry soil notifications, and reset.</p>
      <h4>Automatic Care and Maintenance</h4>
      <p>Automatic Care synchronizes between the side button and mobile switch. When enabled, it checks and adjusts the pod each simulated hour while water is available. Maintenance lifts the pod to its maximum position and prevents adjustment. Leaving Maintenance checks the water and moves the pod to its calculated position.</p>
      <div class="table-wrap"><table><thead><tr><th>Condition</th><th>Feedback</th></tr></thead><tbody>
        <tr><td>Water available and moisture at least half the target</td><td>Blue rim LED.</td></tr>
        <tr><td>Water reaches 0%, or moisture falls below half the target</td><td>Red rim LED; only the relevant reading card turns red. Enabled phone notifications identify the cause.</td></tr>
        <tr><td>Maintenance active</td><td>Blinking yellow rim and Maintenance button; Automatic Care illumination is off and movement is suspended.</td></tr>
        <tr><td>Lighting disabled in Settings</td><td>The selected LEDs turn off; readings and notification preferences remain available.</td></tr>
      </tbody></table></div>
      <p>The soil target ±10% and temperature 18 to 28°C labels are demonstration ranges. The dry soil alert uses the separate threshold of half the target.</p>
    </section>

    <section aria-labelledby="doc-screenshots">
      <h3 id="doc-screenshots" tabindex="-1">Interface in Action</h3>
      <figure><img src={`${base}interface-overview.png`} alt="Smart Planter cutaway, registered Monstera phone interface, and simulation controls side by side" loading="lazy" /><figcaption>Registered planter: the object, companion interface, and simulation panel share the same readings.</figcaption></figure>
      <figure><img src={`${base}interface-maintenance.png`} alt="Maintenance mode with the inner pod raised and the phone showing the active maintenance state" loading="lazy" /><figcaption>Maintenance raises the pod and suspends automatic movement. The rim and Maintenance button blink yellow.</figcaption></figure>
      <figure><img src={`${base}interface-alert.png`} alt="Empty reservoir and dry soil with red warnings and a notification inside the phone" loading="lazy" /><figcaption>After time passes without automatic care, the empty reservoir and dry soil produce corresponding warnings and a mobile banner.</figcaption></figure>
    </section>

    <section aria-labelledby="doc-simulation">
      <h3 id="doc-simulation" tabindex="-1">Simulation Walkthrough</h3>
      <ol>
        <li><strong>Pair a planter:</strong> complete the phone registration flow and open its card.</li>
        <li><strong>Set a target:</strong> choose a soil moisture target, then press Check Water Level and Move Inner Pod. With water available, the moisture reading becomes the target and the pod moves smoothly.</li>
        <li><strong>Compare manual and automatic care:</strong> advance time with Automatic Care off, then turn it on and repeat. Automatic Care reapplies the target while water remains available.</li>
        <li><strong>Run time:</strong> Advance Time runs one hour; Play repeats and Pause stops progress. One simulated hour takes two seconds, consumes eight percentage points of water, and reduces moisture by five points before automatic care is applied.</li>
        <li><strong>Trigger a warning:</strong> continue until the reservoir is empty, or disable Automatic Care and let moisture fall below half the target. Observe the red rim, corresponding card, and enabled notification.</li>
        <li><strong>Refill:</strong> Water Plant gradually fills to 100% and then checks the pod position. It preserves whether playback was running. Checking with no water reduces moisture by ten percentage points instead.</li>
        <li><strong>Maintain:</strong> enter Maintenance from the body or phone, observe the raised pod and blinking lights, then exit to resume positioning based on water level.</li>
      </ol>
      <p>The Info button in the test panel opens the simulation instructions. Rates and immediate moisture changes are simplified demonstration rules, not a physical model of water absorption.</p>
    </section>

    <section aria-labelledby="doc-implementation">
      <h3 id="doc-implementation" tabindex="-1">Implementation</h3>
      <p>The application uses Svelte 5, JavaScript, and Vite. App.svelte switches between Starter and Document. SmartPlanter.svelte owns the shared readings, timing, filling, and care logic. PlanterModel.svelte renders the SVG cutaway and body controls; PlanterPhone.svelte implements the companion device screens and confirmation flows.</p>
      <p>Both interfaces use the same state and action callbacks, so an action on a body button updates the phone and vice versa. A 250 ms timer advances water changes; eight ticks represent an hour. SVG water animation and CSS pod transitions make changes visible. Maintenance guards the adjustment action to keep the pod raised.</p>
      <p>Document.svelte generates its table of contents from section headings. Shared components in lib/common provide a PDF.js canvas viewer and a custom HTML video player. Media is served from public/documents. The static build is packaged with Docker and served by Nginx, including a JavaScript MIME rule for the PDF module worker.</p>
      <p>For the serving and deployment setup, refer to the <a href="https://github.com/shsm0520/homelab-cicd-smoke-test" target="_blank" rel="noreferrer">homelab CI/CD reference repository ↗</a>.</p>
    </section>

    <section aria-labelledby="doc-future">
      <h3 id="doc-future" tabindex="-1">Limitations & Future Work</h3>
      <p>This prototype has no backend or database. Device readings and settings exist only in the current browser session, so it cannot persistently track real device status, retain sensor or care history, or synchronize changes across users and devices. Reloading the page resets the setup. A future backend would support persistent device records, historical readings, and ongoing status management.</p>
      <p>The current interface supports one simulated planter and one selected plant at a time. Users can choose among the included plant presets, but cannot register multiple planters, manage several plants together, or add custom plant profiles. Future work would extend both the interface and data model to support these workflows.</p>
      <ul>
        <li>Connect real sensors and validate how pod position affects moisture over time, including motor travel limits and obstruction handling.</li>
        <li>Replace simulated pairing with device communication, persistent settings, and explicit indicators for disconnection or outdated readings.</li>
        <li>Evaluate labels, alert visibility, and maintenance steps with users; add feedback beyond color to make status easier to interpret.</li>
        <li>Develop measured temperature and nutrient information instead of static demonstration indicators.</li>
        <li>Test watering behavior over time and notification frequency before supporting unattended physical operation.</li>
      </ul>
    </section>

    <section aria-labelledby="doc-ai">
      <h3 id="doc-ai" tabindex="-1">AI Assistance</h3>
      <p>OpenAI Codex assisted with Svelte and SVG implementation, iterative interface changes, debugging, and converting the project documentation into a webpage. The development conversation covered physical and mobile controls, shared state, alerts, simulation timing, document viewers, and deployment configuration.</p>
      <p>I directed the features and revisions, including the addition of body buttons after interviews. Text prepared with AI assistance describes the implemented prototype; it does not supply participant quotes or replace user research. The design drawings, demonstration recording, and presentation are prepared separately by me.</p>
    </section>

    <section aria-labelledby="doc-video">
      <h3 id="doc-video" tabindex="-1">Demo video</h3>
      {#if hasVideo}
        <VideoPlayer src={videoUrl} />
      {:else}
        <div class="media-placeholder"><span aria-hidden="true">▷</span><strong>Demo video coming soon</strong><p>A 2 to 3 minute narrated demonstration will show registration, physical and mobile controls, automatic care, maintenance, and alerts.</p></div>
      {/if}
    </section>

    <section aria-labelledby="doc-presentation">
      <div class="section-heading"><h3 id="doc-presentation" tabindex="-1">Presentation</h3></div>
      {#if hasSlides}
        <PdfViewer src={slidesUrl} title="Presentation slides" />
      {:else}
        <div class="media-placeholder"><span aria-hidden="true">▤</span><strong>Presentation preview coming soon</strong><p>Slides for the 5 to 6 minute class presentation will appear here as a PDF.</p></div>
      {/if}
    </section>



  </div>
</div>
<button class="back-to-top" onclick={toTop} aria-label="Back to top" title="Back to top">↑ <span>Top</span></button>

<style>
  .documentation { display: grid; grid-template-columns: 230px minmax(0, 1fr); gap: 40px; align-items: start; color: #2c4135; }
  .toc { max-height: calc(100vh - 48px); overflow-y: auto; position: sticky; top: 24px; padding: 22px 16px; border: 1px solid #dfe6dc; border-radius: 14px; background: #f6f8f2; }
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
  figure { margin: 24px 0; }
  figure img { display: block; width: 100%; height: auto; border: 1px solid #dfe6dc; border-radius: 10px; }
  figcaption { margin-top: 10px; font-size: 13px; line-height: 1.7; color: #69756b; }
  h4 { font-size: 16px; margin: 24px 0 8px; }
  li { font-size: 14px; line-height: 1.8; color: #69756b; margin-bottom: 10px; }
  .table-wrap { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; line-height: 1.7; }
  th, td { padding: 12px; border-bottom: 1px solid #dfe6dc; text-align: left; vertical-align: top; }
  th { background: #f5f7f1; } td { color: #69756b; }
  .editor-note { padding: 14px; border-left: 3px solid #b19856; background: #faf7ed; }
  h3 { font-size: 23px; margin: 0 0 14px; scroll-margin-top: 24px; }
  h2:focus, h3:focus { outline: none; }
  .section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .media-placeholder { min-height: 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: #f5f7f1; border: 1px dashed #cbd6c4; border-radius: 10px; padding: 20px; }
  .media-placeholder > span { font-size: 36px; color: #879b7f; margin-bottom: 14px; }
  .back-to-top { position: fixed; right: 24px; bottom: 24px; z-index: 30; display: flex; gap: 8px; align-items: center; margin: 0; padding: 13px 18px; border: 0; border-radius: 30px; background: #355d40; color: white; box-shadow: 0 5px 20px #172a2533; cursor: pointer; }
  .back-to-top:hover { background: #244b30; }
  @media (max-width: 760px) { .documentation { grid-template-columns: 1fr; gap: 20px; } .toc { position: static; max-height: none; } nav { grid-template-columns: 1fr 1fr; } section { padding: 16px; } header h2 { font-size: 28px; } .back-to-top { right: 16px; bottom: 16px; } }
</style>
