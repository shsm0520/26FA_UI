<script>
  import SmartPlanter from './lib/SmartPlanter.svelte'
  import Document from './lib/Document.svelte'

  let activePage = 'starter'
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
    <Document />
  {/if}
</main>
