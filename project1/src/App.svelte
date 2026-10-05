<script>
  import SmartPlanter from './lib/SmartPlanter.svelte'

  let activePage = 'starter'
  const sketchUrl = `${import.meta.env.BASE_URL}documents/project1-sketch.pdf`
</script>

<main>
  <h1>Project 1</h1>
  <nav class="project-menu" aria-label="Project 1 menu">
    <button class:active={activePage === 'starter'} aria-pressed={activePage === 'starter'} onclick={() => (activePage = 'starter')}>Starter</button>
    <button class:active={activePage === 'document'} aria-pressed={activePage === 'document'} onclick={() => (activePage = 'document')}>Document</button>
  </nav>

  <div hidden={activePage !== 'starter'}>
    <SmartPlanter active={activePage === 'starter'} />
  </div>

  {#if activePage === 'document'}
    <section class="document-view" aria-labelledby="document-title">
      <div class="document-header">
        <h2 id="document-title">Project Sketch</h2>
        <a href={sketchUrl} target="_blank" rel="noreferrer">Open PDF ↗</a>
      </div>
        <object class="sketch-preview" data={sketchUrl} type="application/pdf" aria-label="Project 1 sketch PDF">
        <p>Preview unavailable. <a href={sketchUrl} target="_blank" rel="noreferrer">Open the sketch PDF</a>.</p>
        </object>
    </section>
  {/if}
</main>
