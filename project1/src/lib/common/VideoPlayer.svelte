<script>
  import { onDestroy } from 'svelte'
  export let src
  let video
  let playing = false
  let error = ''
  let currentTime = 0
  let duration = 0
  let volume = 100
  let muted = false
  let audioContext
  let audioSource
  let gain
  let audioMessage = ''
  function applyVolume() {
    video.muted = muted
    video.volume = gain ? 1 : Math.min(volume / 100, 1)
    if (gain) gain.gain.setTargetAtTime(volume / 100, audioContext.currentTime, .02)
  }
  async function setVolume(value) {
    volume = value
    muted = value === 0
    audioMessage = ''
    try {
      if (volume > 100 && !gain) {
        audioContext ??= new AudioContext()
        const amplifier = audioContext.createGain()
        audioSource = audioContext.createMediaElementSource(video)
        audioSource.connect(amplifier)
        amplifier.connect(audioContext.destination)
        gain = amplifier
      }
      applyVolume()
      if (audioContext?.state === 'suspended') await audioContext.resume()
    } catch {
      volume = Math.min(volume, 100)
      applyVolume()
      audioMessage = 'Audio boost is unavailable in this browser.'
    }
  }
  function toggleMute() {
    if (volume === 0) { setVolume(100); return }
    muted = !muted
    applyVolume()
  }
  onDestroy(() => {
    audioSource?.disconnect()
    gain?.disconnect()
    audioContext?.close().catch(() => {})
  })
  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00'
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
  }
  function seek(time) {
    if (!video || !Number.isFinite(duration) || duration <= 0) return
    video.currentTime = Math.max(0, Math.min(duration, time))
    currentTime = video.currentTime
  }
  async function togglePlayback() {
    if (!video.paused) { video.pause(); return }
    try {
      error = ''
      if (video.ended) video.currentTime = 0
      if (audioContext?.state === 'suspended') await audioContext.resume()
      await video.play()
    } catch { error = 'Unable to play this video.' }
  }
</script>

<div class="video-player">
  <video bind:this={video} {src} preload="metadata" playsinline disablepictureinpicture disableremoteplayback ontimeupdate={() => (currentTime = video.currentTime)} ondurationchange={() => (duration = Number.isFinite(video.duration) ? video.duration : 0)} onplay={() => (playing = true)} onpause={() => (playing = false)} onended={() => (playing = false)} onerror={() => { error = 'Unable to load this video.' }} aria-label="Smart Planter demonstration">
    <track kind="captions" />
  </video>
  <div class="video-controls">
    <input class="timeline" type="range" min="0" max={duration || 1} step="0.1" value={currentTime} disabled={!duration} oninput={(event) => seek(Number(event.currentTarget.value))} aria-label="Video position" aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`} />
    <div class="control-row">
      <button onclick={togglePlayback} aria-label={playing ? 'Pause video' : 'Play video'}>{playing ? 'Ⅱ' : '▶'}</button>
      <div class="volume-control">
        <button class="volume-button" onclick={toggleMute} aria-label={muted ? 'Unmute video' : 'Mute video'} aria-pressed={muted} title={muted ? 'Unmute' : 'Mute'}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M11 4 6 8H3v8h3l5 4Z" fill="currentColor" stroke="none" />
            {#if muted}<path d="m16 9 6 6m0-6-6 6" />{:else}<path d="M15 8a6 6 0 0 1 0 8" />{#if volume >= 100}<path d="M18 5a10 10 0 0 1 0 14" />{/if}{/if}
          </svg>
        </button>
        <div class="volume-slider">
          <input type="range" min="0" max="200" step="5" value={muted ? 0 : volume} oninput={(event) => setVolume(Number(event.currentTarget.value))} aria-label="Video volume" aria-valuetext={muted ? 'Muted' : `${volume}%${volume > 100 ? ', boosted' : ''}`} title={`${volume}%${volume > 100 ? ' · Boost' : ''}`} />
          <output>{muted ? '0%' : `${volume}%`}</output>
        </div>
      </div>
      <button onclick={() => seek(currentTime - 10)} disabled={!duration} aria-label="Back 10 seconds">−10s</button>
      <button onclick={() => seek(currentTime + 10)} disabled={!duration} aria-label="Forward 10 seconds">+10s</button>
      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
    </div>
    {#if audioMessage}<p class="audio-message" role="status">{audioMessage}</p>{/if}
  </div>
</div>
{#if error}<p role="alert">{error}</p>{/if}

<style>
  .video-player { position: relative; overflow: hidden; border-radius: 10px; background: #18251c; }
  video { display: block; width: 100%; max-height: 70vh; }
  .video-controls { padding: 12px 16px; color: white; }
  .timeline { width: 100%; margin: 0 0 10px; accent-color: #a3ca8e; cursor: pointer; }
  .control-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .control-row span { margin-left: auto; font-size: 12px; font-variant-numeric: tabular-nums; }
  .volume-control { display: flex; align-items: center; flex-shrink: 0; }
  .volume-button { display: grid; place-items: center; width: 36px; height: 36px; padding: 6px; border: 0; border-radius: 50%; background: transparent; }
  .volume-slider { display: flex; align-items: center; gap: 8px; width: 0; opacity: 0; overflow: hidden; transition: width 160ms ease, opacity 160ms ease; }
  .volume-control:hover .volume-slider, .volume-control:focus-within .volume-slider { width: 126px; opacity: 1; }
  .volume-slider input { flex: 0 0 76px; width: 76px; margin: 0 0 0 4px; accent-color: white; cursor: pointer; }
  .volume-slider output { font-size: 11px; min-width: 34px; font-variant-numeric: tabular-nums; }
  @media (hover: none) { .volume-slider { width: 126px; opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .volume-slider { transition: none; } }
  .audio-message { color: #fff; }
  button { margin: 0; padding: 8px 12px; border: 1px solid #ffffff60; border-radius: 8px; background: #18251cd9; color: white; font: inherit; font-size: 13px; cursor: pointer; }
  button:disabled { opacity: .4; cursor: default; }
  button:hover { background: #355d40; }
  button:focus-visible { outline: 3px solid white; outline-offset: 3px; }
  p { color: #9b493e; font-size: 13px; }
</style>
