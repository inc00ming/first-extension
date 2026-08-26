const DEFAULT_CANDIDATES = ["xcancel.com", "nitter.net", "lightbrd.com"];
const DEFAULT_HOST = "xcancel.com";
const HOST_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

async function getState() {
  const { targetHost, customHosts, enabled } = await chrome.storage.sync.get([
    "targetHost",
    "customHosts",
    "enabled"
  ]);
  return {
    targetHost: targetHost || DEFAULT_HOST,
    customHosts: Array.isArray(customHosts) ? customHosts : [],
    enabled: enabled !== false
  };
}

function normalizeHost(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
}

function showError(message) {
  const error = document.getElementById("error");
  error.textContent = message;
  error.classList.remove("hidden");
}

function clearError() {
  document.getElementById("error").classList.add("hidden");
}

function renderToggle(enabled) {
  document.getElementById("enabled-toggle").checked = enabled;
  document.getElementById("enabled-label").textContent = enabled
    ? "Redirection on"
    : "Redirection off";
  document.body.classList.toggle("off", !enabled);
}

function render({ targetHost, customHosts, enabled }) {
  renderToggle(enabled);

  const list = document.getElementById("host-list");
  list.textContent = "";

  const allHosts = [...new Set([...DEFAULT_CANDIDATES, ...customHosts])];

  for (const host of allHosts) {
    const item = document.createElement("div");
    item.className = "host-item";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "target";
    radio.value = host;
    radio.id = `host-${host}`;
    radio.checked = host === targetHost;
    radio.addEventListener("change", async () => {
      await chrome.storage.sync.set({ targetHost: host });
      clearError();
    });

    const label = document.createElement("label");
    label.htmlFor = `host-${host}`;
    label.textContent = host;

    item.append(radio, label);

    if (customHosts.includes(host)) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove";
      remove.textContent = "✕";
      remove.title = `Remove ${host}`;
      remove.addEventListener("click", async () => {
        const { customHosts, targetHost } = await getState();
        const next = customHosts.filter((h) => h !== host);
        if (targetHost === host) {
          await chrome.storage.sync.set({
            customHosts: next,
            targetHost: DEFAULT_CANDIDATES[0]
          });
        } else {
          await chrome.storage.sync.set({ customHosts: next });
        }
      });
      item.append(remove);
    }

    list.append(item);
  }

  const addForm = document.getElementById("add-form");
  addForm.onsubmit = async (event) => {
    event.preventDefault();
    const input = document.getElementById("host-input");
    const host = normalizeHost(input.value);

    if (!HOST_PATTERN.test(host)) {
      showError("Enter a valid hostname, e.g. nitter.example.com");
      return;
    }

    const state = await getState();
    if (state.customHosts.includes(host) || DEFAULT_CANDIDATES.includes(host)) {
      showError(`${host} is already in the list`);
      return;
    }

    await chrome.storage.sync.set({
      customHosts: [...state.customHosts, host],
      targetHost: host
    });
    input.value = "";
    clearError();
  };
}

document.getElementById("enabled-toggle").addEventListener("change", async (event) => {
  await chrome.storage.sync.set({ enabled: event.target.checked });
  clearError();
});

getState().then(render);
chrome.storage.onChanged.addListener((_, area) => {
  if (area === "sync") {
    document.getElementById("enabled-toggle").addEventListener("change", async (event) => {
  await chrome.storage.sync.set({ enabled: event.target.checked });
  clearError();
});

getState().then(render);
  }
});
