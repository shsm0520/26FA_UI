<script>
  export let src
  let video
  let playing = false
  let error = ''
  let currentTime = 0
  let duration = 0
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
      <button onclick={() => seek(currentTime - 10)} disabled={!duration} aria-label="Back 10 seconds">−10s</button>
      <button onclick={() => seek(currentTime + 10)} disabled={!duration} aria-label="Forward 10 seconds">+10s</button>
      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
    </div>
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
  button { margin: 0; padding: 8px 12px; border: 1px solid #ffffff60; border-radius: 8px; background: #18251cd9; color: white; font: inherit; font-size: 13px; cursor: pointer; }
  button:disabled { opacity: .4; cursor: default; }
  button:hover { background: #355d40; }
  button:focus-visible { outline: 3px solid white; outline-offset: 3px; }
  p { color: #9b493e; font-size: 13px; }
</style>
