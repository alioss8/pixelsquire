function mountMascot() {
  if (document.getElementById('pixelsquire-root')) return

  const host = document.createElement('div')
  host.id = 'pixelsquire-root'
  host.style.cssText =
    'position:fixed;bottom:16px;right:16px;z-index:2147483647;'

  const shadow = host.attachShadow({ mode: 'closed' })
  const spriteUrl = chrome.runtime.getURL('sprites/knight-idle.png')

  shadow.innerHTML = `
    <style>
      .wrap { position: relative; }
      .knight {
        width: 96px;
        height: 96px;
        image-rendering: pixelated;
        background-image: url(${spriteUrl});
        background-size: 864px 96px;
        background-repeat: no-repeat;
        cursor: pointer;
        animation: idle 1.2s steps(9) infinite;
      }
      @keyframes idle {
        from { background-position: 0 0; }
        to { background-position: -864px 0; }
      }
      .bubble {
        position: absolute;
        bottom: 100px;
        right: 0;
        width: 220px;
        padding: 10px 14px;
        background: #fff;
        border: 3px solid #23262e;
        border-radius: 10px;
        font: 14px/1.4 system-ui, sans-serif;
        color: #23262e;
        display: none;
      }
      .bubble.show { display: block; }
    </style>
    <div class="wrap">
      <div class="bubble" id="bubble"></div>
      <div class="knight" id="knight"></div>
    </div>
  `

  const knight = shadow.getElementById('knight')!
  const bubble = shadow.getElementById('bubble')!

  function showBubble(text: string) {
  bubble.innerHTML = `
    <div>${text}</div>
    <button id="checkin-btn">Görev tamam ⚔️</button>
    <button id="mute-btn">Bugün sustur</button>`

  // ✅ Butonları bul (innerHTML'den SONRA)
  const checkinBtn = bubble.querySelector('#checkin-btn')
  const muteBtn = bubble.querySelector('#mute-btn')

  // ✅ Checkin butonu → CHECKIN_QUICK, sonra balonu kapat
  checkinBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CHECKIN_QUICK' }, () => {
      bubble.classList.remove('show')
    })
  })

  // ✅ Mute butonu → MUTE_TODAY, sonra balonu kapat
  muteBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'MUTE_TODAY' }, () => {
      bubble.classList.remove('show')
    })
  })

  // ✅ Balonu göster
  bubble.classList.add('show')

  // Otomatik kapanma — buton varken 6sn kısa olabilir, 12'ye çıkardım
  setTimeout(() => bubble.classList.remove('show'), 12000)
}

  // Tıklama ile mesaj göster
  knight.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GET_MESSAGE' }, (res) => {
      if (res?.ok) showBubble(res.msg.text)
    })
  })

  // Background'dan gelen mesajları dinle
  chrome.runtime.onMessage.addListener((req) => {
    if (req.type === 'SHOW_MESSAGE') {
      showBubble(req.msg.text)
    }
  })

  document.body.appendChild(host)
}

mountMascot()