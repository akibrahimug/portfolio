# Portfolio Click Inspector (Chrome extension)

Draws how often each link and button was clicked over the live site, from the site's own
cookie-free analytics (`/api/track` → Upstash).

## Install (unpacked)

1. `chrome://extensions` → turn on **Developer mode** → **Load unpacked** → pick this `extension/` folder.
2. Open https://www.kasomaibrahim.dev (or `localhost:3000`), click the extension icon, paste
   `ANALYTICS_READ_KEY` (the value set in Vercel), **Save**.
3. **Show overlay**: every visible link/button gets a badge with its click count; redder means
   more clicks. The popup lists every recorded element on this page, with the ones no longer on
   it marked. **Views by page** lists views for each path.
4. Tick **Don't count my visits on this site** so your own browsing stays out of the numbers
   (it sets `localStorage['track:off']` on that origin).

Tabs that were open before installing need one reload. After editing files here, press the
reload icon on the extension's card.

## How elements are named

`track-key.js` is the contract, and the site imports the same file
(`components/analytics/ClickTracker.tsx`). Keys look like `link:/#work @nav`,
`link:github.com/kasoma @footer`, `button:Send @#contact`. To give an element a stable name
(for example a button whose label changes), add `data-track="name"`. Renaming a link's
target, label or section starts a new count under the new key. The old one shows up as
"Not on the page now".
