<script>
  let waterLevel = 65
  let soilMoisture = 42
  let lightOn = false
  let plantFood = false
  let infoVisible = false

  function waterPlant() {
    waterLevel = Math.max(0, waterLevel - 10)
    soilMoisture = Math.min(100, soilMoisture + 15)
  }

  function toggleLight() {
    lightOn = !lightOn
  }

  function addPlantFood() {
    plantFood = true
  }

  function drySoil() {
    soilMoisture = Math.max(0, soilMoisture - 10)
  }
</script>

<div class="project-layout">
  <section class="device-ui">
    <h2>Device UI</h2>
    <p class="object-label">Smart Planter Display</p>

    <div class="planter-graphic">
      <div class="plant">🌱</div>
      <div class="screen">
        <p>Water: {waterLevel}%</p>
        <p>Soil: {soilMoisture}%</p>
        <p>Light: {lightOn ? 'On' : 'Off'}</p>
        <p>Food: {plantFood ? 'Added' : 'Needed'}</p>
      </div>
    </div>

    <h3>Controls and Indicators</h3>
    <ul>
      <li>Water level shows how much water is available.</li>
      <li>Soil moisture shows whether the plant needs water.</li>
      <li>Grow light can be turned on or off.</li>
      <li>Plant food indicator shows if nutrients were added.</li>
    </ul>
  </section>

  <section class="testing-ui">
    <h2>Testing UI</h2>
    <p><strong>Project:</strong> Smart Planter UI</p>
    <p><strong>Name:</strong> Seunghyeon Ham</p>
    <p><a href="https://github.com/shsm0520/26FA_UI" target="_blank" rel="noreferrer">Project write up</a></p>

    <button on:click={waterPlant}>Water Plant</button>
    <button on:click={toggleLight}>{lightOn ? 'Turn Grow Light Off' : 'Turn Grow Light On'}</button>
    <button on:click={addPlantFood}>Add Plant Food</button>
    <button on:click={drySoil}>Simulate Dry Soil</button>
    <button on:click={() => (infoVisible = !infoVisible)}>Info</button>

    {#if infoVisible}
      <div class="info-box">
        <p>
          Use these buttons to simulate a smart planter. Water Plant lowers the
          stored water level and raises soil moisture. The grow light button
          changes the light status. Add Plant Food updates the nutrient indicator.
          Simulate Dry Soil lowers the soil moisture value.
        </p>
      </div>
    {/if}
  </section>
</div>
