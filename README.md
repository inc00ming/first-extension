# X Redirector

A minimal browser extension (Manifest V3) that redirects **x.com** to a Nitter-compatible
frontend of your choice — e.g. [xcancel.com](https://xcancel.com), [nitter.net](https://nitter.net),
or [lightbrd.com](https://lightbrd.com). You can add any custom instance from the popup.

## How it works

The extension uses the [declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)
API with a single dynamic rule that rewrites the host of any `x.com` navigation. The selected
target host is stored in `chrome.storage.sync` and the rule is kept in sync by the service
worker (`background.js`).

## Load into your browser

### Chrome / Edge / Brave

1. Open `chrome://extensions` (or `edge://extensions` / `brave://extensions`).
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select this project folder.
4. Click the extension icon in the toolbar and pick your redirect target.

### Firefox

Manifest V3 with `declarativeNetRequest` dynamic rules works in recent Firefox versions:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `manifest.json`.
3. Note: the add-on is removed when Firefox restarts. For a permanent install, build a
   signed package or use [web-ext](https://github.com/mozilla/web-ext):

   ```sh
   npx web-ext run
   ```

## Project layout

```
manifest.json    Extension manifest (MV3)
background.js    Service worker: applies/updates the dynamic redirect rule
popup.html/css   Toolbar popup UI
popup.js         Popup logic: candidate list, custom hosts, selection
icons/           Toolbar and store icons
```

## Contributing

1. **Fork** the repository (or create a branch if you have write access).
2. Make your changes. There is no build step — it is plain HTML/JS.
3. Test your changes locally (see *Load into your browser* above). After editing any file,
   hit the reload icon on `chrome://extensions` for the extension card.
4. Commit with a clear message:

   ```sh
   git commit -m "Add support for custom redirect paths"
   ```

5. Open a **pull request** describing what changed and why.

### Guidelines

- Keep the extension dependency-free and minimal.
- Validate any user input (see the hostname pattern in `popup.js`).
- Do not add permissions beyond what is strictly needed.
- Test in at least one Chromium-based browser before opening a PR.

## Reporting issues

Open a GitHub issue with your browser version, the target instance you selected, and
steps to reproduce.
