const SITES = ['https://www.kasomaibrahim.dev', 'http://localhost:3000']
const $ = (id) => document.getElementById(id)

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
const origin = tab?.url ? new URL(tab.url).origin : ''

const ask = (msg) => chrome.tabs.sendMessage(tab.id, msg)
const showError = (text) => {
  $('error').textContent = text
  $('error').hidden = !text
}

async function start() {
  $('where').textContent = origin.replace(/^https?:\/\//, '')
  if (!SITES.includes(origin)) return ($('unsupported').hidden = false)

  let status
  try {
    status = await ask({ type: 'status' })
  } catch {
    return ($('reload').hidden = false) // content script not in this tab (opened before install)
  }
  $('main').hidden = false

  const { readKey = '', days = '30' } = await chrome.storage.local.get(['readKey', 'days'])
  $('key').value = readKey
  $('days').value = days
  $('opt-out').checked = status.optedOut
  setShowing(status.showing)
  if (readKey) await load()
}

let showing = false
function setShowing(on) {
  showing = on
  $('toggle').textContent = on ? 'Hide overlay' : 'Show overlay'
}

let last = null
async function load() {
  showError('')
  const { readKey } = await chrome.storage.local.get('readKey')
  if (!readKey) return showError('Add the read key first.')
  const { path } = await ask({ type: 'status' })
  const url = `${origin}/api/track?path=${encodeURIComponent(path)}&days=${$('days').value}`
  let res
  try {
    res = await fetch(url, { headers: { Authorization: `Bearer ${readKey}` }, cache: 'no-store' })
  } catch (e) {
    return showError(`Could not reach ${origin}.`)
  }
  if (res.status === 401) return showError('The read key was refused.')
  if (!res.ok) return showError((await res.json().catch(() => ({}))).error || `Error ${res.status}`)
  last = await res.json()
  const { onPage = [] } = showing ? await ask({ type: 'show', clicks: last.clicks }) : { onPage: null }
  render(last, onPage)
}

function render(report, onPage) {
  $('report').hidden = false
  $('views').textContent = report.views
  $('path').textContent = report.path
  const present = onPage ? new Set(onPage) : null
  const rows = Object.entries(report.clicks).sort((a, b) => b[1] - a[1])
  $('rows').replaceChildren(
    ...(rows.length ? rows : [['No clicks recorded in this period.', '']]).map(([key, n]) => {
      const tr = document.createElement('tr')
      const name = document.createElement('td')
      name.textContent = key
      if (present && n !== '' && !present.has(key)) {
        name.className = 'off'
        name.append(Object.assign(document.createElement('small'), { textContent: 'Not on the page now' }))
      }
      const count = Object.assign(document.createElement('td'), { className: 'num', textContent: n })
      tr.append(name, count)
      return tr
    }),
  )
  $('pages').replaceChildren(
    ...Object.entries(report.pages)
      .sort((a, b) => b[1] - a[1])
      .map(([p, n]) => {
        const tr = document.createElement('tr')
        tr.append(
          Object.assign(document.createElement('td'), { textContent: p }),
          Object.assign(document.createElement('td'), { className: 'num', textContent: n }),
        )
        return tr
      }),
  )
}

$('key-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  await chrome.storage.local.set({ readKey: $('key').value.trim() })
  await load()
})

$('days').addEventListener('change', async () => {
  await chrome.storage.local.set({ days: $('days').value })
  await load()
})

$('toggle').addEventListener('click', async () => {
  if (showing) {
    await ask({ type: 'hide' })
    setShowing(false)
    if (last) render(last, null)
    return
  }
  setShowing(true)
  await load()
})

$('opt-out').addEventListener('change', async () => {
  const { optedOut } = await ask({ type: 'opt-out', off: $('opt-out').checked })
  $('opt-out').checked = optedOut
})

start()
