// Draws click counts over the page. The popup fetches the counts and sends them here;
// element keys come from track-key.js, the same module the site's tracker uses.
;(() => {
  let contract
  const load = () => (contract ??= import(chrome.runtime.getURL('track-key.js')))

  /** @type {{ clicks: Record<string, number>, path: string } | null} */
  let state = null
  let host = null
  let layer = null
  let frame = 0
  let observer = null

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(() => ((frame = 0), draw()))
  }

  function mount() {
    host = document.createElement('div')
    host.setAttribute('data-click-inspector', '')
    const shadow = host.attachShadow({ mode: 'open' })
    shadow.innerHTML = `<style>
      .layer { position: fixed; inset: 0; pointer-events: none; z-index: 2147483647; font: 600 11px/1 system-ui, sans-serif; }
      .box { position: fixed; border: 2px solid; border-radius: 6px; box-sizing: border-box; }
      .badge { position: fixed; padding: 3px 6px; border-radius: 999px; color: #fff; white-space: nowrap;
               box-shadow: 0 1px 3px rgba(0,0,0,.25); font-variant-numeric: tabular-nums; }
    </style><div class="layer"></div>`
    layer = shadow.querySelector('.layer')
    document.documentElement.append(host)
    addEventListener('scroll', schedule, { capture: true, passive: true })
    addEventListener('resize', schedule)
    observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] })
  }

  function hide() {
    state = null
    observer?.disconnect()
    removeEventListener('scroll', schedule, { capture: true })
    removeEventListener('resize', schedule)
    host?.remove()
    host = layer = observer = null
  }

  async function draw() {
    if (!state || !layer) return
    // Client-side navigation: these counts belong to the page we left.
    if (location.pathname !== state.path) return hide()
    const { TRACKABLE, trackKey } = await load()
    const max = Math.max(1, ...Object.values(state.clicks))
    const parts = []
    const seen = new Set()
    for (const el of document.querySelectorAll(TRACKABLE)) {
      if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) continue
      const key = trackKey(el, location.origin)
      seen.add(key)
      const n = state.clicks[key] ?? 0
      const heat = n / max
      const colour = n ? `rgba(209, 4, 19, ${0.35 + 0.65 * heat})` : 'rgba(120, 113, 108, 0.55)'
      const left = Math.min(Math.max(r.right - 14, 4), innerWidth - 40)
      const top = Math.max(r.top - 9, 2)
      parts.push(
        `<div class="box" style="left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border-color:${colour}"></div>`,
        `<div class="badge" style="left:${left}px;top:${top}px;background:${colour}">${n}</div>`,
      )
    }
    layer.innerHTML = parts.join('')
    return seen
  }

  /** Keys present on the page right now, whether or not they are in view. */
  async function keysOnPage() {
    const { TRACKABLE, trackKey } = await load()
    return [...new Set([...document.querySelectorAll(TRACKABLE)].map((el) => trackKey(el, location.origin)))]
  }

  async function optOut(off) {
    const { OPT_OUT_KEY } = await load()
    if (off === true) localStorage.setItem(OPT_OUT_KEY, '1')
    if (off === false) localStorage.removeItem(OPT_OUT_KEY)
    return localStorage.getItem(OPT_OUT_KEY) === '1'
  }

  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    const answer = async () => {
      switch (msg.type) {
        case 'status':
          return { path: location.pathname, showing: !!state, optedOut: await optOut() }
        case 'show':
          state = { clicks: msg.clicks, path: location.pathname }
          if (!host) mount()
          await draw()
          return { onPage: await keysOnPage() }
        case 'hide':
          hide()
          return {}
        case 'opt-out':
          return { optedOut: await optOut(msg.off) }
      }
    }
    answer().then(reply, (e) => reply({ error: String(e) }))
    return true // reply is async
  })
})()
