type KnightState = 'idle' | 'happy' | 'sad' | 'talk' | 'walk'

const FRAME = 96
const SPEED: Record<KnightState, number> = {
  idle: 1.2, happy: 1.0, sad: 1.4, talk: 1.0, walk: 0.8,
}

function getScene(): string {
  const h = new Date().getHours()
  if (h >= 6 && h < 17) return 'scene-forest.png'
  if (h >= 17 && h < 21) return 'scene-castle.png'
  return 'scene-camp.png'
}

async function mountMascot() {
  if (document.getElementById('pixelsquire-root')) return

  const { mascotHidden } = await chrome.storage.local.get('mascotHidden')
  if (mascotHidden) return

  const host = document.createElement('div')
  host.id = 'pixelsquire-root'
  host.style.cssText =
    'position:fixed;bottom:16px;right:16px;z-index:2147483647;'

  const shadow = host.attachShadow({ mode: 'closed' })

  const sceneUrl = chrome.runtime.getURL(`sprites/${getScene()}`)
  const sprites: Record<KnightState, { url: string; frames: number }> = {
    idle:  { url: chrome.runtime.getURL('sprites/idle.png'),     frames: 9 },
    happy: { url: chrome.runtime.getURL('sprites/happy.png'),    frames: 9 },
    sad:   { url: chrome.runtime.getURL('sprites/sad.png'),      frames: 9 },
    talk:  { url: chrome.runtime.getURL('sprites/talking.png'),  frames: 9 },
    walk:  { url: chrome.runtime.getURL('sprites/walking.png'),  frames: 8 },
  }

  shadow.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

      * { box-sizing: border-box; }

      .wrap { position: relative; width: 140px; height: 140px; }

      .stage {
        position: relative;
        width: 140px;
        height: 140px;
        background-repeat: repeat-x;
        background-size: auto 140px;
        border: 3px solid #000;
        border-radius: 0;
        overflow: hidden;
        image-rendering: pixelated;
        cursor: pointer;
        box-shadow: 4px 4px 0 rgba(0,0,0,0.4);
      }
      .stage.moving {
        animation: scroll 20s linear infinite;
      }
      @keyframes scroll {
        from { background-position: 0 center; }
        to   { background-position: -280px center; }
      }

      .knight {
        position: absolute;
        bottom: 6px;
        left: 50%;
        transform: translateX(-50%);
        width: 96px;
        height: 96px;
        image-rendering: pixelated;
        background-repeat: no-repeat;
      }

      .close {
        position: absolute;
        top: 3px;
        right: 3px;
        width: 18px;
        height: 18px;
        background: #08060d;
        border: 2px solid #000;
        color: #ede4d3;
        font-family: 'Press Start 2P', monospace;
        font-size: 7px;
        line-height: 1;
        padding: 0;
        cursor: pointer;
        z-index: 2;
        opacity: 0;
        transition: opacity 0.15s;
      }
      .stage:hover .close { opacity: 1; }
      .close:active { transform: translate(1px, 1px); }

      .bubble {
        position: absolute;
        bottom: 152px;
        right: 0;
        width: 240px;
        padding: 14px;
        background: #08060d;
        border: 3px solid #000;
        box-shadow: 4px 4px 0 #000;
        font-family: 'Press Start 2P', monospace;
        color: #ede4d3;
        display: none;
      }
      .bubble.show { display: block; }

      .bubble .msg { font-size: 9px; line-height: 1.6; margin-bottom: 12px; }
      .bubble .btns { display: flex; flex-direction: column; gap: 8px; }

      .bubble button {
        font-family: 'Press Start 2P', monospace;
        font-size: 8px;
        padding: 9px 8px;
        border: 3px solid #000;
        cursor: pointer;
        color: #1c130c;
      }
      .bubble button:active {
        transform: translate(2px, 2px);
        box-shadow: none !important;
      }

      .bubble .checkin { background: #ffcd75; box-shadow: 3px 3px 0 #000; }
      .bubble .mute { background: #566c86; color: #ede4d3; box-shadow: 3px 3px 0 #000; }
    </style>
    <div class="wrap">
      <div class="bubble" id="bubble"></div>
      <div class="stage" id="stage">
        <div class="knight" id="knight"></div>
        <button class="close" id="close-btn" title="Şövalyeyi gizle">✕</button>
      </div>
    </div>
  `

  const stage = shadow.getElementById('stage')!
  const knight = shadow.getElementById('knight')!
  const bubble = shadow.getElementById('bubble')!
  const closeBtn = shadow.getElementById('close-btn')!

  stage.style.backgroundImage = `url(${sceneUrl})`

  // ---- Sprite animasyonu (kare sayısı state'e göre değişiyor) ----
  const styleEl = shadow.querySelector('style')!
  const madeKeyframes = new Set<number>()

  function ensureKeyframes(frames: number) {
    if (madeKeyframes.has(frames)) return
    styleEl.textContent += `
      @keyframes cycle${frames} {
        from { background-position: 0 0; }
        to   { background-position: -${frames * FRAME}px 0; }
      }`
    madeKeyframes.add(frames)
  }

  function applySprite(state: KnightState) {
    const { url, frames } = sprites[state]
    ensureKeyframes(frames)
    knight.style.backgroundImage = `url(${url})`
    knight.style.backgroundSize = `${frames * FRAME}px ${FRAME}px`
    knight.style.animation = `cycle${frames} ${SPEED[state]}s steps(${frames}) infinite`
  }

  // ---- State makinesi ----
  let stateTimer: number | undefined

  function defaultState(): KnightState {
    const h = new Date().getHours()
    return (h >= 21 || h < 6) ? 'idle' : 'walk'
  }

  function setState(state: KnightState, duration?: number) {
    applySprite(state)

    if (state === 'walk') stage.classList.add('moving')
    else stage.classList.remove('moving')

    if (stateTimer !== undefined) {
      clearTimeout(stateTimer)
      stateTimer = undefined
    }
    if (duration !== undefined) {
      stateTimer = window.setTimeout(() => setState(defaultState()), duration)
    }
  }

  setState(defaultState())

  // ---- Balon ----
  let bubbleTimer: number | undefined

  function hideBubble() {
    bubble.classList.remove('show')
    if (bubbleTimer !== undefined) {
      clearTimeout(bubbleTimer)
      bubbleTimer = undefined
    }
  }

  function showBubble(text: string) {
    bubble.innerHTML = `
      <div class="msg">${text}</div>
      <div class="btns">
        <button class="checkin" id="checkin-btn">GÖREV TAMAM ⚔️</button>
        <button class="mute" id="mute-btn">BUGÜN SUSTUR</button>
      </div>`

    const checkinBtn = bubble.querySelector('#checkin-btn')
    const muteBtn = bubble.querySelector('#mute-btn')

    checkinBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      chrome.runtime.sendMessage({ type: 'CHECKIN_QUICK' }, () => {
        hideBubble()
        setState('happy', 3000)
      })
    })

    muteBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      chrome.runtime.sendMessage({ type: 'MUTE_TODAY' }, () => {
        hideBubble()
        setState('sad', 2500)
      })
    })

    bubble.classList.add('show')
    setState('talk')

    if (bubbleTimer !== undefined) clearTimeout(bubbleTimer)
    bubbleTimer = window.setTimeout(() => {
      hideBubble()
      setState(defaultState())
    }, 12000)
  }

  // ---- Kapatma ----
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    chrome.storage.local.set({ mascotHidden: true })
    host.remove()
  })

  // Panoya tıklayınca mesaj göster
  stage.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GET_MESSAGE' }, (res) => {
      if (res?.ok) showBubble(res.msg.text)
    })
  })

  // Background'dan gelen mesajlar
  chrome.runtime.onMessage.addListener((req) => {
    if (req.type === 'SHOW_MESSAGE') {
      showBubble(req.msg.text)
    }
    if (req.type === 'SHOW_MASCOT') {
      mountMascot()
    }
  })

  document.body.appendChild(host)
}

// Popup'tan "göster" gelirse mascot kapalıyken de yakalanmalı
chrome.runtime.onMessage.addListener((req) => {
  if (req.type === 'SHOW_MASCOT') mountMascot()
})

mountMascot()