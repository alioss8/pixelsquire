function mountMascot() {
  // zaten varsa tekrar ekleme
  if (document.getElementById('pixelsquire-root')) return

  const host = document.createElement('div')
  host.id = 'pixelsquire-root'
  host.style.cssText =
    'position:fixed;bottom:16px;right:16px;z-index:2147483647;'

  const shadow = host.attachShadow({ mode: 'closed' })

  const spriteUrl = chrome.runtime.getURL('sprites/knight-idle.png')

  shadow.innerHTML = `
    <style>
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
    </style>
    <div class="knight"></div>
  `

  document.body.appendChild(host)
}

mountMascot()