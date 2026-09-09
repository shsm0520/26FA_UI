<script>
  let battery = 82
  let locked = true
  let lightOn = false
  let locationAlert = false
  let infoVisible = false

  function toggleLock() {
    locked = !locked
  }

  function toggleLight() {
    lightOn = !lightOn
  }

  function findBag() {
    locationAlert = true
    battery = Math.max(0, battery - 2)
  }

  function chargeBattery() {
    battery = Math.min(100, battery + 10)
  }
</script>

<div class="project-layout">
  <section class="device-ui">
    <h2>Device UI</h2>
    <p class="object-label">Smart Backpack Display</p>

    <div class="backpack-graphic">
      <div class="screen">
        <p>{locked ? 'Locked' : 'Unlocked'}</p>
        <p>Battery: {battery}%</p>
        <p>Light: {lightOn ? 'On' : 'Off'}</p>
        <p>Location Alert: {locationAlert ? 'Active' : 'Off'}</p>
      </div>
    </div>

    <h3>Controls and Indicators</h3>
    <ul>
      <li>Lock status shows if the backpack is locked or unlocked.</li>
      <li>Battery level shows the power remaining.</li>
      <li>Light status shows whether the safety light is on.</li>
      <li>Location alert helps the user find the backpack.</li>
    </ul>
  </section>

  <section class="testing-ui">
    <h2>Testing UI</h2>
    <p><strong>Project:</strong> Smart Backpack UI</p>
    <p><strong>Name:</strong> Seunghyeon Ham</p>
    <p><a href="https://github.com/shsm0520/26FA_UI" target="_blank" rel="noreferrer">Project write up</a></p>

    <button on:click={toggleLock}>{locked ? 'Unlock Bag' : 'Lock Bag'}</button>
    <button on:click={toggleLight}>{lightOn ? 'Turn Light Off' : 'Turn Light On'}</button>
    <button on:click={findBag}>Find Bag</button>
    <button on:click={chargeBattery}>Charge Battery</button>
    <button on:click={() => (infoVisible = !infoVisible)}>Info</button>

    {#if infoVisible}
      <div class="info-box">
        <p>
          Use these buttons to simulate the smart backpack. Lock changes the lock
          indicator, light changes the safety light, find bag activates the
          location alert and uses battery, and charge battery increases battery.
        </p>
      </div>
    {/if}
  </section>
</div>
