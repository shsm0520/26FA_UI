<script>
  import PlanterModel from './PlanterModel.svelte'
  let cupHeight = 100
  let waterLevel = 65
  let soilMoisture = 42
  let currentTemperature = 24
  let targetSoilMoisture = 100
  let podControlsVisible = false
  let elapsedHours = 0
  function waterPlant() {
    waterLevel = 100
    checkWaterAndMovePod()
  }
  function advanceTime() {
    elapsedHours += 1
    waterLevel = Math.max(0, waterLevel - 1)
    soilMoisture = Math.max(0, soilMoisture - 5)
  }
  function checkWaterAndMovePod() {
    // Concept simulation: higher water raises the pod; a higher moisture
    // target lowers it. Reserve travel for both inputs within 0–100%.
    cupHeight = Math.round(waterLevel * 0.6 + (100 - targetSoilMoisture) * 0.4)
    soilMoisture = waterLevel === 0 ? Math.max(0, soilMoisture - 10) : Number(targetSoilMoisture)
    podControlsVisible = true
  }
</script>

<div class="starter-layout">
  <section aria-labelledby="concept-title">
    <span class="eyebrow">01 / CONCEPT</span>
    <h2 id="concept-title">Smart Planter</h2>
    <p class="description">Cross-section showing the internal structure and height-adjustable cup.</p>
    <PlanterModel {cupHeight} {waterLevel} {soilMoisture} {targetSoilMoisture} />
    <p class="description">The outer wall and water tank are fixed, while the inner cup moves. The supports are a conceptual structure to explain the mechanism.</p>
  </section>
  <section class="phone-panel" aria-labelledby="phone-title">
    <span class="eyebrow">02 / DEVICE UI</span>
    <h2 id="phone-title">Mobile Screen</h2>
    <div class="phone-frame">
      <div class="phone-status" aria-hidden="true"><span>9:41</span><span>▰</span></div>
      <div class="phone-island" aria-hidden="true"></div>
      <div class="phone-content">
        <span class="eyebrow">MY PLANT</span>
        <h3>Smart Planter</h3>
        <p class="description">Check your plant's status.</p>
        <div class="plant-symbol" aria-hidden="true">🌱</div>
        <dl class="readings" aria-live="polite">
          <div><dt>Water Level</dt><dd>{waterLevel}%</dd></div>
          <div><dt>Soil Moisture</dt><dd>{soilMoisture}%</dd></div>
          <div><dt>Target Moisture</dt><dd>{targetSoilMoisture}%</dd></div>
          <div><dt>Current Temperature</dt><dd>{currentTemperature}°C</dd></div>
          <div><dt>Plant Food</dt><dd>Needed</dd></div>
          <div><dt>Cup Height</dt><dd>{cupHeight}%</dd></div>
        </dl>
      </div>
      <div class="home-indicator" aria-hidden="true"></div>
    </div>
  </section>
  <section class="control-panel" aria-labelledby="controls-title">
    <span class="eyebrow">03 / CONTROLS</span>
    <h2 id="controls-title">Controls</h2>
    <p class="description">Use the buttons to change the state and view it on the screen.</p>
    <div class="height-control">
      <div class="height-heading"><label for="target-moisture">Set Target Soil Moisture</label><output for="target-moisture">{targetSoilMoisture}%</output></div>
      <input id="target-moisture" type="range" min="0" max="100" step="1" bind:value={targetSoilMoisture} />
      <p class="description">Set the target, then press the Check Water Level button below. The lower the target, the higher the cup moves.</p>
    </div>
    <div class="action-buttons">
      <button onclick={waterPlant}>Water Plant</button>
      <button onclick={advanceTime}>Advance Time (+1h)</button>
      <button onclick={checkWaterAndMovePod} aria-controls="pod-controls">Check Water Level and Move Inner Pod</button>
    </div>
    <p class="description" aria-live="polite">Elapsed time: {elapsedHours} hours · Water level: {waterLevel}%</p>
    <p class="description">Watering: Fills water level to 100% and automatically moves the cup · Advancing 1 hour decreases water level by 1%.</p>
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
.phone-content { padding: 30px 24px 40px; }
h3 { font-size: 27px; margin: 12px 0 8px; color: #2c4135; }
.plant-symbol { text-align: center; font-size: 72px; padding: 22px 0; }
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
@media (max-width: 760px) { .starter-layout { grid-template-columns: minmax(0, 1fr); } .phone-panel { width: min(100%, 393px); justify-self: center; } .control-panel { grid-column: auto; } .action-buttons { grid-template-columns: 1fr; } .phone-content { padding: 20px 20px 30px; } .plant-symbol { padding: 10px 0; font-size: 54px; } .readings div { padding: 14px 0; } }
</style>