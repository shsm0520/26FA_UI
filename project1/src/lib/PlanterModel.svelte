<script>
  export let cupHeight = 45
  export let waterLevel = 65
  // Cup bottom (y=425) meets the water surface (492 - level * 0.86).
  $: lift = Number(cupHeight) * 0.86 - 67
  $: waterY = 492 - waterLevel * 0.86
</script>
<div class="drawing">
      <svg viewBox="0 0 640 620" role="img" aria-labelledby="planter-title planter-desc">
        <title id="planter-title">높이 조절 컵이 있는 스마트 화분 단면도</title>
        <desc id="planter-desc">화분 외벽 일부를 잘라 흙을 담는 안쪽 컵, 센서, LED와 아래 물탱크를 보여줍니다. 현재 컵 높이는 조절 범위의 {cupHeight}퍼센트입니다.</desc>
        <defs>
          <linearGradient id="shell" x1="0" x2="1"><stop stop-color="#e2e8df"/><stop offset=".5" stop-color="#fafbf6"/><stop offset="1" stop-color="#b6c7b9"/></linearGradient>
          <linearGradient id="cup" x1="0" x2="1"><stop stop-color="#8eac8b"/><stop offset=".45" stop-color="#d5e2bd"/><stop offset="1" stop-color="#9ab695"/></linearGradient>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b8e2e9"/><stop offset="1" stop-color="#6daebb"/></linearGradient>
          <pattern id="soil" width="18" height="15" patternUnits="userSpaceOnUse"><rect width="18" height="15" fill="#77624c"/><circle cx="4" cy="5" r="1.4" fill="#bfa382"/><path d="M11 11h3" stroke="#4d4036" stroke-width="2"/></pattern>
        </defs>

        <ellipse cx="307" cy="548" rx="191" ry="25" fill="#243e3010"/>
        <!-- Rear wall remains fixed while the inner assembly travels. -->
        <path d="M139 220 Q307 140 475 220 L445 484 Q307 557 169 484Z" fill="url(#shell)" stroke="#6b8272" stroke-width="2"/>
        <ellipse cx="307" cy="220" rx="168" ry="55" fill="#e9eee2" stroke="#6b8272" stroke-width="2"/>
        <ellipse cx="307" cy="220" rx="151" ry="42" fill="#c6d3c2" stroke="#92a58e"/>

        
        <path d="M163 218 C207 169 406 169 451 218" fill="none" stroke="#d2a2ca" stroke-width="8"/>
        <path d="M163 218 C207 169 406 169 451 218" fill="none" stroke="#fae2f5" stroke-width="3"/>

        <!-- Fixed guide rails and a conceptual telescoping support. -->
        <path d="M286 472V384h42v88" fill="#b6c4b9" stroke="#6b8272" stroke-width="2"/>
        <rect x="296" y={399 - lift} width="22" height={74 + lift} rx="5" fill="#e5ebe4" stroke="#6b8272" stroke-width="2"/>



        <ellipse cx="307" cy="492" rx="125" ry="35" fill="#e5eeea" stroke="#829c92" stroke-width="2"/>
        {#if waterLevel > 0}
          <g class="water-fill" aria-label={`Water level ${waterLevel}%`}>
            <path d={`M182 ${waterY}Q307 ${waterY + 50} 432 ${waterY}L432 492Q307 542 182 492Z`} fill="url(#water)" stroke="#5f929a" stroke-width="2"/>
            <ellipse cx="307" cy={waterY} rx="125" ry="35" fill="#b9e0e3" fill-opacity=".85" stroke="#5f929a" stroke-width="2"/>
            <path d={`M211 ${waterY + 2}q24 -9 48 0t48 0t48 0t48 0`} fill="none" stroke="#f0ffff" stroke-width="2"/>
          </g>
        {/if}
        
        <g transform={`translate(0, ${-lift})`}>
          <path d="M204 314 L220 454 Q307 497 394 454 L410 314Z" fill="url(#cup)" stroke="#526d53" stroke-width="2"/>
          <ellipse cx="307" cy="314" rx="103" ry="34" fill="#e0e9cc" stroke="#526d53" stroke-width="2"/>
          <ellipse cx="307" cy="314" rx="92" ry="26" fill="url(#soil)"/>
          <path d="M228 338L237 393 M241 344L248 400" stroke="#ecf2db" stroke-width="3" opacity=".65"/>
          <path d="M302 311C304 278 315 248 305 207" fill="none" stroke="#466b3e" stroke-width="6" stroke-linecap="round"/>
          <path d="M308 265C264 262 251 232 251 217C288 216 313 235 308 265Z" fill="#7f9e60" stroke="#4f7042" stroke-width="1.5"/>
          <path d="M309 238C311 207 339 185 368 185C365 219 341 239 309 238Z" fill="#597e48" stroke="#416238" stroke-width="1.5"/>
          <path d="M260 225L306 262 M313 232L358 194" stroke="#c8d6aa" fill="none"/>
          <rect x="368" y="286" width="8" height="48" rx="3" fill="#455f57"/>
          <rect x="365" y="279" width="14" height="18" rx="4" fill="#e0b467" stroke="#816e43"/>
          <circle cx="372" cy="286" r="2" fill="#fff2bc"/>
          <path d="M224 366H174L155 350H86" class="leader"/>
          <text x="84" y="339" class="label">Height adjust pod</text>
          <path d="M381 285H469L486 272H548" class="leader"/>
          <text x="477" y="260" class="label">soil sensor</text>
        </g>
        
        <!-- Narrow front edges describe the removed wall section. -->
        <path d="M169 484Q307 557 445 484L442 506Q307 575 172 506Z" fill="url(#shell)" stroke="#6b8272" stroke-width="2"/>
        <path d="M170 207L132 172H86" class="leader"/><text x="84" y="159" class="label">LED Indicater</text>
        <path d="M442 349H485L503 363H550" class="leader"/><text x="478" y="386" class="label">Half cut view</text>
        <path d="M400 477H476L494 465H550" class="leader"/><text x="478" y="452" class="label">Water reserver</text>
        <text x="307" y="596" text-anchor="middle" class="caption">CUTAWAY VIEW / SVG CONCEPT</text>
      </svg>
</div>
<style>
.drawing { background: radial-gradient(ellipse at center, #eef2e7, #fcfcf7 70%); border-radius: 12px; }
svg { display: block; width: 100%; height: auto; }
.leader { fill: none; stroke: #839587; stroke-width: 1.2; }
.label { font-size: 13px; fill: #536655; font-family: Arial, sans-serif; }
.caption { font-size: 10px; fill: #8a9588; letter-spacing: 2px; }
</style>
