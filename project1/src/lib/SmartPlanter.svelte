<script>
  import { onMount } from 'svelte'
  export let active = true
  let playing = false
  let stepping = false
  let filling = false
  let timeSteps = 0
  let infoDialog
  $: if (!active) { playing = false; stepping = false }
  function togglePlayback() {
    if (playing || stepping) { playing = false; stepping = false }
    else playing = true
  }
  onMount(() => {
    const timer = setInterval(() => {
      if (filling) {
        waterLevel = Math.min(100, waterLevel + 2)
        if (waterLevel === 100) { filling = false; checkWaterAndMovePod() }
        return
      }
      if (!active || (!playing && !stepping)) return
      waterLevel = Math.max(0, waterLevel - 1)
      timeSteps += 1
      if (timeSteps === 8) {
        timeSteps = 0
        elapsedHours += 1
        soilMoisture = Math.max(0, soilMoisture - 5)
        if (autoCare && !maintenanceMode && waterLevel > 0) checkWaterAndMovePod()
        stepping = false
      }
    }, 250)
    return () => clearInterval(timer)
  })
  import PlanterPhone from './PlanterPhone.svelte'
  import PlanterModel from './PlanterModel.svelte'
  let cupHeight = 100
  let waterLevel = 100
  let soilMoisture = 42
  let currentTemperature = 24
  let targetSoilMoisture = 100
  let podControlsVisible = false
  let elapsedHours = 0
  let autoCare = false
  let maintenanceMode = false
  let paired = false
  let ledEnabled = true
  let buttonLedEnabled = true
  function toggleAutoCare() {
    autoCare = !autoCare
    if (autoCare && !maintenanceMode && waterLevel > 0) checkWaterAndMovePod()
  }
  function toggleMaintenance() {
    maintenanceMode = !maintenanceMode
    if (maintenanceMode) cupHeight = 100
    else checkWaterAndMovePod()
  }
  function waterPlant() {
    if (waterLevel === 100) checkWaterAndMovePod()
    else filling = true
  }
  function advanceTime() {
    if (!filling && !playing && !stepping) stepping = true
  }
  function checkWaterAndMovePod() {
    if (maintenanceMode) return
    // Concept simulation: higher water raises the pod; a higher moisture
    // target lowers it. Reserve travel for both inputs within 0–100%.
    cupHeight = Math.min(100, Math.round(waterLevel + (100 - targetSoilMoisture) * 0.15))
    soilMoisture = waterLevel === 0 ? Math.max(0, soilMoisture - 10) : Number(targetSoilMoisture)
    podControlsVisible = true
  }
</script>

<div class="starter-layout">
  <section aria-labelledby="concept-title">
    <span class="eyebrow">01 / CONCEPT</span>
    <h2 id="concept-title">Smart Planter</h2>
    <p class="description">Cross-section showing the internal structure and height-adjustable cup.</p>
    <PlanterModel {buttonLedEnabled} {ledEnabled} {cupHeight} {waterLevel} {soilMoisture} {targetSoilMoisture} {maintenanceMode} {autoCare} onMaintenance={toggleMaintenance} onAdjustHeight={toggleAutoCare} />
    <p class="description">The outer wall and water tank are fixed, while the inner cup moves. The supports are a conceptual structure to explain the mechanism.</p>
  </section>
  <section class="phone-panel" aria-labelledby="phone-title">
    <span class="eyebrow">02 / DEVICE UI</span>
    <h2 id="phone-title">Mobile Screen</h2>
    <div class="phone-frame">
      <div class="phone-status" aria-hidden="true"><span>9:41</span><span>▰</span></div>
      <div class="phone-island" aria-hidden="true"></div>
      <PlanterPhone bind:buttonLedEnabled bind:ledEnabled bind:autoCare bind:maintenanceMode bind:paired onToggleMaintenance={toggleMaintenance} onToggleAutoCare={toggleAutoCare} bind:targetSoilMoisture bind:waterLevel bind:soilMoisture bind:cupHeight bind:currentTemperature bind:elapsedHours bind:podControlsVisible>
        <dl class="readings" aria-live="polite">
          <div><dt>Target Moisture</dt><dd>{targetSoilMoisture}%</dd></div>
          <div><dt>Cup Height</dt><dd>{cupHeight}%</dd></div>
        </dl>
      </PlanterPhone>
      <div class="home-indicator" aria-hidden="true"></div>
    </div>
  </section>
  <section class="control-panel" aria-labelledby="controls-title">
    <button class="info-button" onclick={() => infoDialog.showModal()} aria-haspopup="dialog" aria-controls="simulation-info">ⓘ Info</button>
    <span class="eyebrow">03 / CONTROLS</span>
    <h2 id="controls-title">Controls</h2>
    <p class="description">Use the buttons to change the state and view it on the screen.</p>
    <div class="height-control">
      <div class="height-heading"><label for="target-moisture">Set Target Soil Moisture</label><output for="target-moisture">{targetSoilMoisture}%</output></div>
      <input id="target-moisture" type="range" min="0" max="100" step="1" bind:value={targetSoilMoisture} />
      <p class="description">Set the target, then press the Check Water Level button below. The lower the target, the higher the cup moves.</p>
    </div>
    <div class="action-buttons">
      <button onclick={waterPlant} disabled={filling}>{filling ? 'Filling water…' : 'Water Plant'}</button>
      <div class="time-controls">
        <button onclick={advanceTime} disabled={filling || playing || stepping}>Advance Time (+1h)</button>
        <button class="playback" onclick={togglePlayback} disabled={filling} aria-label={playing || stepping ? 'Pause simulation' : 'Play simulation'} title={playing || stepping ? 'Pause simulation' : 'Play simulation'}>{playing || stepping ? 'Ⅱ' : '▶'}</button>
      </div>
      <button onclick={checkWaterAndMovePod} disabled={maintenanceMode || filling} aria-controls="pod-controls">Check Water Level and Move Inner Pod</button>
    </div>
    <p class="description" aria-live="polite">Elapsed time: {elapsedHours} hours · Water level: {waterLevel}%</p>
    <p class="description">Watering: Fills water level to 100% and automatically moves the cup · Every 2 seconds simulates 1 hour: water −8%, soil moisture −5%. Water fills gradually. Playback pauses while refilling and resumes afterward if it was running.</p>
    <dialog bind:this={infoDialog} id="simulation-info" class="info-dialog" aria-labelledby="info-title">
        <div class="info-header"><h3 id="info-title">How to test the planter</h3><button onclick={() => infoDialog.close()} aria-label="Close information">×</button></div>
        <p class="description"><strong>Water Plant:</strong> gradually fills the tank to 100%, then adjusts the pod to the target moisture. Continuous playback resumes after filling if it was running; paused playback stays paused.</p>
        <p class="description"><strong>Advance Time:</strong> runs one simulated hour. Play repeats hours; Pause freezes time. Each hour takes 2 seconds and consumes 8% water and 5% soil moisture.</p>
        <p class="description"><strong>Check Water Level:</strong> moves the pod and applies the moisture target. With no water, moisture drops by 10% instead.</p>
        <p class="description"><strong>Automatic Care:</strong> automatically adjusts the pod after each hour while water is available. Works from the planter button even without mobile pairing.</p>
        <p class="description"><strong>Maintenance:</strong> holds the pod at maximum height and blocks automatic movement. Finishing checks the water and moves the pod again.</p>
        <p class="description"><strong>Alerts:</strong> empty water or moisture below half the target triggers a red LED and enabled mobile notifications. Lighting and notifications can be changed in Settings.</p>
    </dialog>
    {#if podControlsVisible}
      <div class="height-control" id="pod-controls">
        <p class="water-reading" aria-live="polite">Water Level <strong>{waterLevel}%</strong></p>
        <div class="height-heading"><span>Inner Pod Height</span><output>{cupHeight}%</output></div>
        <p class="description" role="status">{waterLevel === 0 ? 'Out of water. Pressing the Check Water Level button will decrease Soil Moisture by 10%.' : 'Pressing the Check Water Level button moves the cup and sets Soil Moisture to the target.'}</p>
      </div>
    {/if}
    <div class="project-info"><p>Seunghun Lee · Smart Planter UI</p><a href="https://github.com/shsm0520/26FA_UI" target="_blank" rel="noreferrer">Project codebase ↗</a></div>
  </section>
</div>

<style>
.starter-layout { display: grid; grid-template-columns: minmax(0, 1fr) 393px 270px; gap: 24px; align-items: stretch; }
section { min-width: 0; padding: 20px; border: 1px solid #e0e5dc; border-radius: 14px; }
.eyebrow { color: #788574; font-size: 10px; font-weight: 700; letter-spacing: 1.7px; }
h2 { margin: 12px 0; font-size: 22px; color: #2c4135; }
.description { color: #69756b; font-size: 13px; line-height: 1.8; }
.phone-panel { padding: 20px 0 0; border: 0; }
.phone-frame { width: 100%; aspect-ratio: 393 / 852; box-sizing: border-box; border: 9px solid #252725; border-radius: 52px; position: relative; background: #f7f9f3; box-shadow: 0 12px 30px #243e3014; overflow: hidden; }
.phone-status { display: flex; justify-content: space-between; padding: 17px 25px; font-size: 13px; font-weight: bold; }
.phone-island { position: absolute; width: 112px; height: 30px; border-radius: 20px; top: 10px; left: 50%; transform: translateX(-50%); background: #252725; }
.readings { margin: 0; }
.readings div { display: flex; gap: 10px; justify-content: space-between; padding: 19px 0; border-bottom: 1px solid #e0e5dc; font-size: 14px; }
dt { color: #69756b; } dd { margin: 0; font-weight: bold; color: #35533a; }
.home-indicator { position: absolute; bottom: 10px; left: 33%; width: 34%; height: 5px; background: #252725; border-radius: 8px; }
.height-control { background: #f4f6ef; padding: 16px; border-radius: 10px; margin: 24px 0; }
.height-heading { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 16px; gap: 10px; }
output { font-weight: bold; color: #35533a; }
input[type="range"] { width: 100%; margin: 0; accent-color: #466b45; cursor: pointer; }
.water-reading { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; margin: 0 0 24px; color: #35533a; }
button { border: 1px solid #ced8c8; border-radius: 7px; background: white; color: #35533a; cursor: pointer; font: inherit; font-size: 13px; }
button:hover { background: #edf3e8; } button:disabled { opacity: .5; cursor: default; }
.action-buttons { display: grid; gap: 10px; }
.action-buttons button { width: 100%; margin: 0; padding: 13px 12px; text-align: left; }
.project-info { border-top: 1px solid #e0e5dc; margin-top: 24px; padding-top: 16px; color: #788574; font-size: 11px; line-height: 1.8; }
a { color: #466b45; }
@media (max-width: 1150px) { .starter-layout { grid-template-columns: minmax(0, 1fr) 340px; } .control-panel { grid-column: 1 / -1; } .action-buttons { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 760px) { .starter-layout { grid-template-columns: minmax(0, 1fr); } .phone-panel { width: min(100%, 393px); justify-self: center; } .control-panel { grid-column: auto; } .action-buttons { grid-template-columns: 1fr; } .readings div { padding: 14px 0; } }
 .time-controls { display: grid; grid-template-columns: 4fr 1fr; gap: 8px; }
 .time-controls button.playback { text-align: center; padding: 10px 0; font-size: 18px; }
 .control-panel { position: relative; }
 .info-button { position: absolute; top: 12px; right: 12px; margin: 0; padding: 6px 9px; font-size: 12px; }
 .info-dialog { width: min(560px, calc(100vw - 48px)); box-sizing: border-box; max-height: 80vh; overflow-y: auto; padding: 24px; border: 1px solid #d9e2d4; border-radius: 18px; background: #fafcf7; color: #2c4135; box-shadow: 0 18px 60px #17251b35; }
 .info-dialog::backdrop { background: #18261d80; backdrop-filter: blur(3px); }
 .info-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
 .info-header h3 { margin: 0; font-size: 21px; }
 .info-header button { margin: 0; font-size: 22px; padding: 3px 10px; }
</style>
