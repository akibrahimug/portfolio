/**
 * The tracking contract, shared by the site and the click-inspector extension.
 *
 * Plain ES module on purpose: the site imports it (`@/extension/track-key.js`) and the
 * extension's content script loads it with `import(chrome.runtime.getURL(...))`, so both
 * name an element the same way and the overlay's counts land on the element that was clicked.
 *
 * A click counts for the nearest link, button or `[data-track]` element. Its key is:
 *  - `data-track="name"` when set (use it to split two identical links, or to name a
 *    button whose label changes);
 *  - `link:/path#hash` for same-site links, `link:host/path` for other sites,
 *    `link:mailto` / `link:tel` for those schemes (the address itself is not recorded);
 *  - `button:<aria-label or visible text>` for buttons;
 *  then, unless named, ` @<region>`: the nearest nav/header/footer landmark or section id around it, so the
 *  nav's "Work" link and the footer's are counted apart (e.g. `link:/#work @nav`).
 */

export const TRACKABLE = 'a[href], button, [data-track]'

const MAX_KEY = 120

/** @param {string} s */
const squash = (s) => s.replace(/\s+/g, ' ').trim()

/**
 * @param {Element} el    a trackable element (see TRACKABLE)
 * @param {string} origin the page origin, e.g. location.origin
 * @returns {string}
 */
export function trackKey(el, origin) {
  const named = el.getAttribute('data-track')
  if (named) return squash(named).slice(0, MAX_KEY) // an explicit name is used as written
  const key = baseKey(el, origin)
  const where = region(el)
  return (where ? `${key} @${where}` : key).slice(0, MAX_KEY)
}

// React's useId ids («r0», _r_0_) change between builds: never a region.
const STABLE_ID = /^(?!_r_)[A-Za-z][\w-]*$/

/** @param {Element} el */
function region(el) {
  for (let at = el.parentElement; at && at !== document.body; at = at.parentElement) {
    const tag = at.tagName.toLowerCase()
    if (tag === 'nav' || tag === 'header' || tag === 'footer') return tag
    if (at.id && STABLE_ID.test(at.id)) return `#${at.id}`
  }
  return ''
}

/**
 * @param {Element} el
 * @param {string} origin
 */
function baseKey(el, origin) {
  if (el.tagName === 'A') {
    const href = el.getAttribute('href') ?? ''
    let url
    try {
      url = new URL(href, origin + '/')
    } catch {
      return 'link:invalid'
    }
    if (url.protocol === 'mailto:' || url.protocol === 'tel:') return `link:${url.protocol.slice(0, -1)}`
    const where = url.origin === origin ? `${url.pathname}${url.hash}` : `${url.host}${url.pathname.replace(/\/$/, '')}`
    return `link:${where}`.slice(0, MAX_KEY)
  }

  const label = squash(el.getAttribute('aria-label') || el.textContent || '')
  return `button:${label || '(unnamed)'}`.slice(0, MAX_KEY)
}

/**
 * localStorage flag on the site's origin: when set, the tracker sends nothing from this
 * browser. The extension sets it ("Don't count my visits") so your own testing stays out.
 */
export const OPT_OUT_KEY = 'track:off'
