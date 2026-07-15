type KnightState = 'idle' | 'happy' | 'sad' | 'talk'

function getScene(): string {
  const h = new Date().getHours()
  if (h >= 6 && h < 17) return 'scene-forest.png'
  if (h >= 17 && h < 21) return 'scene-castle.png'
  return 'scene-camp.png'
}

function mountMascot() {
  if (document.getElementById('pixelsquire-root')) return

  const host = document.createElement('div')
  host.id = 'pixelsquire-root'
  host.style.cssText =
    'position:fixed;bottom:16px;right:16px;z-index:2147483647;'

  const shadow = host.attachShadow({ mode: 'closed' })

  const sceneUrl = chrome.runtime.getURL(`sprites/${getScene()}`)
  const sprites: Record<KnightState, string> = {
    idle:  chrome.runtime.getURL('sprites/idle.png'),
    happy: chrome.runtime.getURL('sprites/happy.png'),
    sad:   chrome.runtime.getURL('sprites/sad.png'),
    talk:  chrome.runtime.getURL('sprites/talking.png'),
  }

  shadow.innerHTML = `
    <style>
      * { box-sizing: border-box; }

      .wrap { position: relative; }

      .stage {
        position: relative;
        width: 140px;
        height: 140px;
        background-size: cover;
        background-position: center;
        border: 3px solid #000;
        border-radius: 10px;
        overflow: hidden;
        image-rendering: pixelated;
        cursor: pointer;
        box-shadow: 4px 4px 0 rgba(0,0,0,0.4);
      }

      .knight {
        position: absolute;
        bottom: 6px;
        left: 50%;
        transform: translateX(-50%);
        width: 96px;
        height: 96px;
        image-rendering: pixelated;
        background-size: 864px 96px;
        background-repeat: no-repeat;
        animation: walkcycle 1.2s steps(9) infinite;
      }
      @keyframes walkcycle {
        from { background-position: 0 0; }
        to { background-position: -864px 0; }
      }

      .bubble {
        position: absolute;
        bottom: 152px;
        right: 0;
        width: 240px;
        padding: 14px;
        background: #1a1c2c;
        border: 3px solid #000;
        box-shadow: 4px 4px 0 #000;
        font-family: 'Press Start 2P', monospace;
        color: #f4f4f4;
        display: none;
      }
      .bubble.show { display: block; }

      .bubble .msg {
        font-size: 9px;
        line-height: 1.6;
        margin-bottom: 12px;
      }

      .bubble .btns {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .bubble button {
        font-family: 'Press Start 2P', monospace;
        font-size: 8px;
        padding: 9px 8px;
        border: 3px solid #000;
        cursor: pointer;
        color: #1a1c2c;
      }
      .bubble button:active {
        transform: translate(2px, 2px);
        box-shadow: none !important;
      }

      .bubble .checkin {
        background: #ffcd75;
        box-shadow: 3px 3px 0 #000;
      }
      .bubble .mute {
        background: #566c86;
        color: #f4f4f4;
        box-shadow: 3px 3px 0 #000;
      }
    </style>
    <div class="wrap">
      <div class="bubble" id="bubble"></div>
      <div class="stage" id="stage">
        <div class="knight" id="knight"></div>
      </div>
    </div>
  `

  const stage = shadow.getElementById('stage')!
  const knight = shadow.getElementById('knight')!
  const bubble = shadow.getElementById('bubble')!

  stage.style.backgroundImage = `url(${sceneUrl})`

  // ---- State makinesi ----
  let stateTimer: number | undefined

  function setState(state: KnightState, duration?: number) {
    knight.style.backgroundImage = `url(${sprites[state]})`

    // önceki geri-dönüş sayacını iptal et
    if (stateTimer !== undefined) {
      clearTimeout(stateTimer)
      stateTimer = undefined
    }

    // geçici state ise süre sonunda idle'a dön
    if (duration !== undefined) {
      stateTimer = window.setTimeout(() => setState('idle'), duration)
    }
  }

  setState('idle')

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

    checkinBtn?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'CHECKIN_QUICK' }, () => {
        hideBubble()
        setState('happy', 3000)
      })
    })

    muteBtn?.addEventListener('click', () => {
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
      setState('idle')
    }, 12000)
  }

  // Panoya tıklayınca mesaj göster
  stage.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GET_MESSAGE' }, (res) => {
      if (res?.ok) showBubble(res.msg.text)
    })
  })

  // Background'dan (alarm) gelen mesajları dinle
  chrome.runtime.onMessage.addListener((req) => {
    if (req.type === 'SHOW_MESSAGE') {
      showBubble(req.msg.text)
    }
  })

  document.body.appendChild(host)
}

mountMascot()