type KnightState = 'idle' | 'happy' | 'sad' | 'talk' | 'walk'

const FRAME = 96
const SPEED: Record<KnightState, number> = {
  idle: 1.2, happy: 1.0, sad: 1.4, talk: 1.0, walk: 0.8,
}

const MASCOT_SIZE = 140
const DRAG_THRESHOLD = 4

function getScene(): string {
  const h = new Date().getHours()
  if (h >= 6 && h < 17) return 'scene-forest.png'
  if (h >= 17 && h < 21) return 'scene-castle.png'
  return 'scene-camp.png'
}

async function mountMascot() {
  if (document.getElementById('pixelsquire-root')) return

  let stored: { mascotHidden?: boolean; mascotPos?: unknown }
  try {
    stored = await chrome.storage.local.get(['mascotHidden', 'mascotPos'])
  } catch {
    // extension reload edildiğinde bu sekmedeki eski content script bağlamı geçersiz kalır
    return
  }
  if (stored.mascotHidden) return
  const mascotPos = stored.mascotPos as { left: number; top: number } | undefined

  const host = document.createElement('div')
  host.id = 'pixelsquire-root'
  host.style.cssText = 'position:fixed;z-index:2147483647;'

  function clampPos(left: number, top: number) {
    const maxLeft = Math.max(0, window.innerWidth - MASCOT_SIZE)
    const maxTop = Math.max(0, window.innerHeight - MASCOT_SIZE)
    return {
      left: Math.min(Math.max(0, left), maxLeft),
      top: Math.min(Math.max(0, top), maxTop),
    }
  }

  if (mascotPos && typeof mascotPos.left === 'number' && typeof mascotPos.top === 'number') {
    const { left, top } = clampPos(mascotPos.left, mascotPos.top)
    host.style.left = `${left}px`
    host.style.top = `${top}px`
  } else {
    host.style.right = '16px'
    host.style.bottom = '16px'
  }

  const shadow = host.attachShadow({ mode: 'closed' })

  // CSS @font-face src: url() sayfanın CSP'sine tabi olduğundan bazı sitelerde
  // engelleniyor. fetch() ile çekip FontFace API'siyle kaydetmek buna tabi değil.
  void loadPixelFont()
  async function loadPixelFont() {
    try {
      const [latinBuf, extBuf] = await Promise.all([
        fetch(chrome.runtime.getURL('fonts/press-start-2p-latin.woff2')).then((r) => r.arrayBuffer()),
        fetch(chrome.runtime.getURL('fonts/press-start-2p-latin-ext.woff2')).then((r) => r.arrayBuffer()),
      ])
      const latinFace = new FontFace('Press Start 2P', latinBuf, { weight: '400', style: 'normal' })
      const extFace = new FontFace('Press Start 2P', extBuf, {
        weight: '400',
        style: 'normal',
        unicodeRange:
          'U+100-2BA, U+2BD-2C5, U+2C7-2CC, U+2CE-2D7, U+2DD-2FF, U+304, U+308, U+329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
      })
      await Promise.all([latinFace.load(), extFace.load()])
      document.fonts.add(latinFace)
      document.fonts.add(extFace)
    } catch {
      // font yüklenemezse monospace'e düşer
    }
  }

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
      * { box-sizing: border-box; }

      .wrap {
        position: relative;
        width: 140px;
        height: 140px;
        user-select: none;
        -webkit-user-select: none;
      }

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
        cursor: grab;
        touch-action: none;
        box-shadow: 4px 4px 0 rgba(0,0,0,0.4);
      }
      .stage:active { cursor: grabbing; }
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

      .bubble .msg { font-size: 9px; line-height: 1.6; }
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
    bubble.innerHTML = `<div class="msg">${text}</div>`

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
  function activateStage() {
    chrome.runtime.sendMessage({ type: 'GET_MESSAGE' }, (res) => {
      if (res?.ok) showBubble(res.msg.text)
    })
  }

  // ---- Sürükleme (tıklama ile ayırt edilir, sayfa butonlarının üstünde kalmasın diye) ----
  let dragging = false
  let dragMoved = false
  let dragStartX = 0
  let dragStartY = 0
  let pointerOffsetX = 0
  let pointerOffsetY = 0

  stage.addEventListener('pointerdown', (e) => {
    if (e.target === closeBtn) return
    e.preventDefault()
    dragging = true
    dragMoved = false
    dragStartX = e.clientX
    dragStartY = e.clientY
    const rect = host.getBoundingClientRect()
    pointerOffsetX = e.clientX - rect.left
    pointerOffsetY = e.clientY - rect.top
    stage.setPointerCapture(e.pointerId)
  })

  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return

    if (!dragMoved) {
      const dx = e.clientX - dragStartX
      const dy = e.clientY - dragStartY
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      dragMoved = true
    }

    const { left, top } = clampPos(e.clientX - pointerOffsetX, e.clientY - pointerOffsetY)
    host.style.left = `${left}px`
    host.style.top = `${top}px`
    host.style.right = 'auto'
    host.style.bottom = 'auto'
  })

  stage.addEventListener('pointerup', (e) => {
    if (!dragging) return
    dragging = false
    stage.releasePointerCapture(e.pointerId)

    if (dragMoved) {
      const { left, top } = clampPos(e.clientX - pointerOffsetX, e.clientY - pointerOffsetY)
      chrome.storage.local.set({ mascotPos: { left, top } })
    } else {
      activateStage()
    }
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