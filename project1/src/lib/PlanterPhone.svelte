<script>
  import { onDestroy, tick } from 'svelte'
  export let targetSoilMoisture = 100
  export let waterLevel = 100
  export let soilMoisture = 42
  export let cupHeight = 100
  export let currentTemperature = 24
  export let elapsedHours = 0
  export let podControlsVisible = false
  export let autoCare = false
  export let ledEnabled = true
  export let buttonLedEnabled = true
  export let maintenanceMode = false
  export let paired = false
  export let onToggleMaintenance = () => {}
  export let onToggleAutoCare = () => {}
  let waterAlerts = true
  let moistureAlerts = true
  let notification = ''
  let wasEmpty = false
  let wasDry = false
  $: paired = devices.length > 0
  $: updateAlerts(paired, waterLevel, soilMoisture, targetSoilMoisture, waterAlerts, moistureAlerts)
  function updateAlerts(connected, water, soil, target, notifyWater, notifySoil) {
    const empty = connected && water === 0
    const dry = connected && soil < target * 0.5
    const messages = []
    if (empty && !wasEmpty && notifyWater) messages.push('Water tank empty. Please refill your planter.')
    if (dry && !wasDry && notifySoil) messages.push('Soil moisture is below 50% of your target.')
    if (messages.length) notification = messages.join(' ')
    if (!connected || (!empty && !dry) || (!notifyWater && !notifySoil)) notification = ''
    wasEmpty = empty
    wasDry = dry
  }
  function toggleMaintenance() {
    onToggleMaintenance()
  }
  function toggleAutoCare() { onToggleAutoCare() }
  let devices = []
  let activeId = null
  let nextId = 1
  let stage = 'home'
  let adding = false
  let pairing = false
  let timer
  let resetOpen = false
  let cancelButton
  let confirmButton
  let previousFocus
  async function openReset() {
    previousFocus = document.activeElement
    resetOpen = true
    await tick()
    cancelButton?.focus()
  }
  function closeReset() {
    resetOpen = false
    previousFocus?.focus()
  }
  function confirmationKey(event) {
    if (!resetOpen) return
    if (event.key === 'Escape') { event.preventDefault(); closeReset() }
    if (event.key === 'Tab') {
      event.preventDefault()
      if (document.activeElement === cancelButton) confirmButton?.focus()
      else cancelButton?.focus()
    }
  }
  let heading
  let nameDraft = ''
  let nameMessage = ''
  let registrationName = ''
  let deleteMode = false
  $: selected = devices.find(device => device.id === activeId)
  const plants = [
    { name: 'Monstera', symbol: '🌿', target: 60 },
    { name: 'Basil', symbol: '🌱', target: 70 },
    { name: 'Succulent', symbol: '🌵', target: 25 },
  ]
  const defaults = () => ({ targetSoilMoisture: 100, waterLevel: 100, soilMoisture: 42, cupHeight: 100, currentTemperature: 24, elapsedHours: 0, podControlsVisible: false })
  function snapshot() {
    return { targetSoilMoisture, waterLevel, soilMoisture, cupHeight, currentTemperature, elapsedHours, podControlsVisible }
  }
  function save() {
    devices = devices.map(device => device.id === activeId ? { ...device, state: snapshot() } : device)
  }
  function restore(state) {
    ({ targetSoilMoisture, waterLevel, soilMoisture, cupHeight, currentTemperature, elapsedHours, podControlsVisible } = state)
  }
  async function navigate(next) {
    if (next === 'settings') {
      nameDraft = selected?.name ?? ''
      nameMessage = ''
    }
    stage = next
    await tick()
    heading?.focus()
  }
  function home() { save(); navigate('home') }
  function openDevice(device) {
    save()
    const latest = devices.find(item => item.id === device.id)
    activeId = latest.id
    restore(latest.state)
    navigate('dashboard')
  }
  function addDevice() {
    if (devices.length) { openDevice(devices[0]); return }
    save(); adding = true; registrationName = `Planter ${String(nextId).padStart(2, '0')}`; navigate('pair')
  }
  function connect(event) {
    event.preventDefault()
    if (!registrationName.trim() || pairing) return
    registrationName = registrationName.trim()
    pairing = true
    timer = setTimeout(() => { pairing = false; navigate('plants') }, 900)
  }
  function cancelAdd() { clearTimeout(timer); pairing = false; adding = false; navigate('home') }
  function selectPlant(plant) {
    if (adding) {
      if (devices.length) { adding = false; openDevice(devices[0]); return }
      save()
      const device = { id: nextId++, name: registrationName, plant, state: { ...defaults(), targetSoilMoisture: plant.target } }
      devices = [...devices, device]
      activeId = device.id
      restore(device.state)
      adding = false
    } else {
      targetSoilMoisture = plant.target
      devices = devices.map(device => device.id === activeId ? { ...device, plant, state: snapshot() } : device)
    }
    navigate('dashboard')
  }
  function reset() {
    ledEnabled = true
    buttonLedEnabled = true
    autoCare = false
    maintenanceMode = false
    waterAlerts = true
    moistureAlerts = true
    notification = ''
    devices = devices.filter(device => device.id !== activeId)
    activeId = devices[0]?.id ?? null
    restore(devices[0]?.state ?? defaults())
    closeReset()
    navigate('home')
  }
  function renamePlanter(event) {
    event.preventDefault()
    const name = nameDraft.trim()
    if (!name) {
      nameMessage = 'Please enter a planter name.'
      return
    }
    devices = devices.map(device => device.id === activeId ? { ...device, name } : device)
    nameDraft = name
    nameMessage = 'Name saved.'
  }
  onDestroy(() => clearTimeout(timer))
</script>

{#if notification && selected}
  <div class="ios-notification" role="alert">
    <div class="notification-header"><span class="app-icon" aria-hidden="true">🌱</span><span>SMART PLANTER</span><span class="notification-time">now</span><button class="dismiss-notification" onclick={() => (notification = '')} aria-label="Dismiss notification">×</button></div>
    <strong>{selected.name}</strong>
    <p>{notification}</p>
  </div>
{/if}

<svelte:window onkeydown={confirmationKey} />

<div class="screen" inert={resetOpen}>

  {#if stage === 'home'}
    <span class="eyebrow">MY GREEN SPACE</span>
    <h3 bind:this={heading} tabindex="-1">My planter</h3>
    <p>{devices.length} connected {devices.length === 1 ? 'planter' : 'planters'}</p>
    {#if !devices.length}
      <div class="welcome-icon" aria-hidden="true">🌱</div>
      <p>Connect your planter to monitor and control it.</p>
    {/if}
    {#each devices as device (device.id)}
      <div class="planter-card">
      <strong class="card-name">{device.name}</strong>
      <button class="plant card-open" onclick={() => openDevice(device)}>
        <span class="plant-icon" aria-hidden="true">{device.plant.symbol}</span>
        <span><strong>{device.plant.name}</strong><small>Target moisture {device.id === activeId ? targetSoilMoisture : device.state.targetSoilMoisture}%</small><small>Water {device.id === activeId ? waterLevel : device.state.waterLevel}% · Soil {device.id === activeId ? soilMoisture : device.state.soilMoisture}%</small></span><span aria-hidden="true">›</span>
      </button>
      <div class="card-actions">
        <button class="icon-button" title="Edit name" aria-label={`Edit ${device.name}`} onclick={async () => { activeId = device.id; await navigate('settings'); document.getElementById('planter-name')?.focus() }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15Z"/></svg>
        </button>
        <button class="icon-button delete-button" title="Delete planter" onclick={() => { activeId = device.id; deleteMode = true; openReset() }} aria-label={`Delete ${device.name}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>
        </button>
      </div>
      </div>
    {/each}
    {#if !devices.length}<button class="primary" onclick={addDevice}>+ Add planter</button>{/if}
    <p class="hint">One planter can be paired and controlled at a time.</p>
  {:else if stage === 'pair'}
    <button class="change" onclick={cancelAdd}>← My planter</button>
    <div class="welcome-icon" aria-hidden="true">🌱</div>
    <h3 bind:this={heading} tabindex="-1">Connect a planter</h3>
    <div class="device"><strong>Smart Planter {String(nextId).padStart(2, '0')}</strong><span>Demo device · Ready to pair</span></div>
    <form onsubmit={connect}>
      <label for="registration-name">Planter name</label>
      <input id="registration-name" class="name-input" type="text" bind:value={registrationName} maxlength="32" required disabled={pairing} />
      <button type="submit" class="primary" disabled={pairing || !registrationName.trim()}>{pairing ? 'Connecting…' : 'Connect Planter'}</button>
    </form>
    <p class="hint" role="status">{pairing ? 'Pairing with your demo planter…' : 'Simulated pairing. No Bluetooth connection required.'}</p>
  {:else if stage === 'plants'}
    <button class="change" onclick={() => adding ? cancelAdd() : navigate('settings')}>← Back</button>
    <h3 bind:this={heading} tabindex="-1">Choose your plant</h3>
    <p>Select a starting moisture target for this planter.</p>
    <div class="plants">
      {#each plants as plant}
        <button class="plant" onclick={() => selectPlant(plant)}><span class="plant-icon" aria-hidden="true">{plant.symbol}</span><span><strong>{plant.name}</strong><small>Demo target · {plant.target}%</small></span><span aria-hidden="true">›</span></button>
      {/each}
    </div>
    <p class="hint">Demo values for this prototype, not plant care recommendations.</p>
  {:else if stage === 'settings'}
    <button class="change" onclick={() => navigate('dashboard')}>← Status</button>
    <h3 bind:this={heading} tabindex="-1">Planter settings</h3>
    <div class="device"><strong>{selected.name}</strong><span>{selected.plant.name} · Demo connection</span></div>
    <form onsubmit={renamePlanter}>
      <label for="planter-name">Planter name</label>
      <input id="planter-name" class="name-input" type="text" bind:value={nameDraft} maxlength="32" required aria-describedby="name-message" />
      <button type="submit">Save name</button>
      <p id="name-message" class="hint" role="status">{nameMessage}</p>
    </form>
    <button onclick={() => { adding = false; navigate('plants') }}>Change plant</button>
    <label for="phone-target">Target soil moisture · {targetSoilMoisture}%</label>
    <input id="phone-target" type="range" min="0" max="100" step="1" bind:value={targetSoilMoisture}/>
    <div class="preferences">
      <strong>Planter lighting</strong>
      <label class="toggle-row"><span>Rim LED</span><input type="checkbox" role="switch" bind:checked={ledEnabled}/></label>
      <label class="toggle-row"><span>Button LEDs</span><input type="checkbox" role="switch" bind:checked={buttonLedEnabled}/></label>
      <p class="hint">Control rim and side-button lighting independently, including maintenance blinking. Buttons still work with their lights off.</p>
    </div>
    <div class="preferences">
      <strong>Notifications</strong>
      <label class="toggle-row"><span>Empty water tank</span><input type="checkbox" bind:checked={waterAlerts}/></label>
      <label class="toggle-row"><span>Low soil moisture</span><input type="checkbox" bind:checked={moistureAlerts}/></label>
      <p class="hint">Alerts appear inside this app when the LED turns red.</p>
    </div>
    <div class="danger-zone"><strong>Reset this planter</strong><p>Remove this planter’s pairing, plant and saved readings. Pair another planter after resetting this one.</p><button class="reset" onclick={() => { deleteMode = false; openReset() }}>Reset planter</button></div>
  {:else}
    <div class="toolbar"><button class="change" onclick={home}>← My planter</button><button class="change" onclick={() => navigate('settings')}>Settings</button></div>
    <div class="plant-heading"><span aria-hidden="true">{selected.plant.symbol}</span><div><span class="eyebrow">{selected.name}</span><h3 bind:this={heading} tabindex="-1">{selected.plant.name}</h3></div></div>
    <div class="indicators" aria-label="Planter indicators">
      <div class="indicator" class:alert-state={waterLevel === 0}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C10 7 5 11 5 15a7 7 0 0 0 14 0c0-4-5-8-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/></svg>
        <strong>{waterLevel}%</strong><span>Water Level</span>
      </div>
      <div class="indicator bounded-indicator" class:alert-state={soilMoisture < targetSoilMoisture * 0.5}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c-2 3-5 6-5 9a5 5 0 0 0 10 0c0-3-3-6-5-9ZM3 19h18M5 22h14"/></svg>
        <small class="upper-limit">Max {Math.min(100, Number(targetSoilMoisture) + 10)}%</small>
        <strong>{soilMoisture}%</strong>
        <small class="lower-limit">Min {Math.max(0, Number(targetSoilMoisture) - 10)}%</small>
        <span>Soil Moisture</span>
      </div>
      <div class="indicator">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z"/><path d="M12 8v10M17 6h3M17 10h2"/></svg>
        <small class="upper-limit">Max 28°C</small>
        <strong>{currentTemperature}°C</strong>
        <small class="lower-limit">Min 18°C</small>
        <span>Temperature</span>
      </div>
      <div class="indicator">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V11M12 15C4 16 3 11 3 7c6 0 9 2 9 8ZM12 11C12 5 16 3 21 3c0 5-3 9-9 8Z"/></svg>
        <strong>Needed</strong><span>Plant Food</span>
      </div>
    </div>
    <p class="range-note">Demo ranges: soil target ±10%; temperature 18–28°C.</p>
    <details class="status-details">
      <summary>Details</summary>
      <slot />
    </details>
    <div class="care-controls">
      <button role="switch" aria-checked={autoCare} onclick={toggleAutoCare}>Automatic care <strong>{autoCare ? 'ON' : 'OFF'}</strong></button>
      <p class="hint">{maintenanceMode ? 'Automatic movement is paused during maintenance.' : autoCare ? 'Adjusts the pod to your moisture target as time passes, while water is available.' : 'Pod movement is manual. Sensor readings still update.'}</p>
      <button aria-pressed={maintenanceMode} onclick={toggleMaintenance}>{maintenanceMode ? 'Finish maintenance' : 'Maintenance mode'}</button>
      <p class="hint">{maintenanceMode ? 'Pod held at maximum height for refilling or cleaning.' : 'Raises the pod to maximum height and holds it there.'}</p>
    </div>
    <p class="hint">The concept view and Controls follow this planter.</p>
  {/if}
</div>
{#if resetOpen}
<div class="phone-modal-overlay">
<div class="phone-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description" tabindex="-1">
  <h3 id="reset-title">{deleteMode ? 'Delete' : 'Reset'} {selected?.name ?? 'planter'}?</h3>
  <p id="reset-description">Remove this planter and its saved setup? You can pair a new planter from the home screen.</p>
  <div class="dialog-actions"><button bind:this={cancelButton} onclick={closeReset}>Cancel</button><button bind:this={confirmButton} class="primary" onclick={reset}>{deleteMode ? 'Delete planter' : 'Reset this planter'}</button></div>
</div>
</div>
{/if}

<style>
  .screen { position: absolute; inset: 58px 0 26px; padding: 18px 24px 24px; overflow-y: auto; scrollbar-width: thin; color: #2c4135; }
  .eyebrow { font-size: 10px; letter-spacing: 1.6px; color: #788574; font-weight: bold; }
  h3 { margin: 10px 0; font-size: 27px; line-height: 1.25; letter-spacing: -.7px; }
  h3:focus { outline: none; }
  p { font-size: 13px; line-height: 1.8; color: #69756b; }
  .welcome-icon { font-size: 64px; padding: 20px 0 28px; }
  .device { padding: 18px; margin: 24px 0 18px; background: #eaf0e4; border-radius: 14px; font-size: 14px; }
  .device span { display: block; font-size: 11px; color: #69756b; margin-top: 8px; }
  button { width: 100%; padding: 12px; margin: 8px 0; font: inherit; font-size: 13px; border: 1px solid #ced8c8; border-radius: 10px; background: white; color: #35533a; cursor: pointer; }
  button:hover { background: #eaf0e4; }
  button:focus-visible { outline: 2px solid #35533a; outline-offset: 3px; }
  button.primary { background: #355d40; color: white; border-color: #355d40; }
  button:disabled { opacity: .6; cursor: wait; }
  .hint { font-size: 11px; line-height: 1.7; }
  .plants { margin: 24px 0; }
  .plant { display: flex; align-items: center; gap: 14px; text-align: left; padding: 18px 12px; }
  .plant > span:last-child { margin-left: auto; }
  .plant small { display: block; font-size: 11px; margin-top: 6px; color: #69756b; }
  .plant-icon { font-size: 30px; }
  .plant-heading { display: flex; align-items: center; gap: 14px; }
  .plant-heading > span { font-size: 42px; }
  .plant-heading h3 { font-size: 25px; }
  .change { width: auto; padding: 7px 12px; font-size: 11px; }
  .reset { margin-top: 24px; background: transparent; color: #82574e; }
  .planter-card { position: relative; margin: 8px 0 16px; border: 1px solid #ced8c8; border-radius: 10px; background: white; transition: background 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
  .planter-card:hover, .planter-card:focus-within { background: #eaf0e4; border-color: #8ea888; box-shadow: 0 3px 10px #35533a12; }
  .planter-card .card-open:hover { background: transparent; }
  .card-name { display: block; min-height: 20px; padding: 12px 84px 8px 14px; font-size: 14px; line-height: 20px; overflow-wrap: anywhere; }
  .card-open { min-width: 0; width: 100%; margin: 0; border: 0; background: transparent; }
  .card-open > span:nth-child(2) { min-width: 0; overflow-wrap: anywhere; }
  .card-actions { position: absolute; top: 4px; right: 4px; display: flex; gap: 2px; }
  .icon-button { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; padding: 8px; margin: 0; border: 0; background: transparent; }
  .icon-button svg { width: 18px; height: 18px; }
  .delete-button { color: #9b493e; }
  .phone-modal-overlay { position: absolute; inset: 0; z-index: 40; display: flex; align-items: center; justify-content: center; padding: 20px; background: #16251c70; backdrop-filter: blur(3px); }
  .phone-dialog { box-sizing: border-box; width: 100%; max-height: 100%; overflow-y: auto; border: 1px solid #ffffffaa; border-radius: 22px; padding: 22px; color: #2c4135; background: #f6f8f2f5; box-shadow: 0 15px 40px #14251b30; text-align: center; }
  .phone-dialog h3 { font-size: 22px; }
  .dialog-actions { display: flex; gap: 12px; }
  .toolbar { display: flex; justify-content: space-between; gap: 8px; }
  label { display: block; font-size: 13px; margin: 24px 0 12px; }
  input { width: 100%; accent-color: #355d40; }
  .name-input { box-sizing: border-box; padding: 12px; border: 1px solid #ced8c8; border-radius: 8px; background: white; color: #2c4135; font: inherit; font-size: 14px; }
  .danger-zone { border-top: 1px solid #d9dfd3; margin-top: 36px; padding-top: 24px; font-size: 14px; }
  .ios-notification { position: absolute; top: 52px; left: 10px; right: 10px; z-index: 20; padding: 12px 14px 14px; border: 1px solid #ffffffa8; border-radius: 22px; background: #edf0edf0; backdrop-filter: blur(22px); box-shadow: 0 10px 30px #17231e40; color: #202a23; animation: banner-in 300ms ease-out; }
  .notification-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; color: #59645d; font-size: 10px; letter-spacing: .5px; }
  .app-icon { display: grid; place-items: center; width: 23px; height: 23px; border-radius: 6px; background: #d0e7c6; font-size: 16px; }
  .notification-time { margin-left: auto; letter-spacing: 0; }
  .ios-notification strong { font-size: 13px; }
  .ios-notification p { margin: 4px 0 0; font-size: 12px; line-height: 1.5; color: #354139; }
  button.dismiss-notification { display: grid; place-items: center; width: 26px; height: 26px; margin: 0; padding: 0; border: 0; border-radius: 50%; background: #d8dfd8; color: #4b574e; font-size: 18px; }
  @keyframes banner-in { from { opacity: 0; transform: translateY(-32px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .ios-notification { animation: none; } }
  .care-controls { margin: 18px 0; }
  .indicators { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 5px; margin: 20px 0 12px; }
  .indicator { display: grid; grid-template-rows: 24px 14px 20px 14px auto; justify-items: center; align-items: center; gap: 5px; padding: 13px 2px; border: 1px solid #dfe6d8; border-radius: 12px; background: #edf2e8; text-align: center; }
  .indicator svg { grid-row: 1; }
  .indicator .upper-limit { grid-row: 2; }
  .indicator strong { grid-row: 3; }
  .indicator .lower-limit { grid-row: 4; }
  .indicator span { grid-row: 5; }
  .upper-limit, .lower-limit { font-size: 9px; color: #687661; white-space: nowrap; }
  .range-note { font-size: 10px; margin: 0 0 12px; color: #788574; }
  .indicator.alert-state { background: #fff0ed; border-color: #e5a69f; }
  .indicator.alert-state svg { stroke: #cf3d42; }
  .indicator.alert-state strong { color: #b52f35; }
  .indicator.alert-state span, .alert-state .upper-limit, .alert-state .lower-limit { color: #96504d; }
  .indicator svg { width: 24px; height: 24px; fill: none; stroke: #527451; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  .indicator strong { font-size: 13px; font-variant-numeric: tabular-nums; }
  .indicator span { font-size: 9px; color: #687661; line-height: 1.4; }
  .status-details { border-bottom: 1px solid #d9dfd3; padding-bottom: 12px; }
  .status-details summary { cursor: pointer; color: #355d40; font-size: 12px; padding: 8px 0; }
  .care-controls button strong { float: right; }
  .preferences { border-top: 1px solid #d9dfd3; margin-top: 24px; padding-top: 20px; font-size: 14px; }
  .toggle-row { display: flex; justify-content: space-between; align-items: center; margin: 16px 0; }
  .toggle-row input { width: 18px; height: 18px; }
</style>
