const RULE_ID = 1;
const DEFAULT_HOST = "xcancel.com";

async function getState() {
  const { targetHost = DEFAULT_HOST, enabled = true } =
    await chrome.storage.sync.get(["targetHost", "enabled"]);
  return { targetHost, enabled };
}

async function applyRedirectRule({ targetHost, enabled }) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: enabled
      ? [
          {
            id: RULE_ID,
            priority: 1,
            action: {
              type: "redirect",
              redirect: { transform: { host: targetHost } }
            },
            condition: {
              urlFilter: "||x.com",
              resourceTypes: ["main_frame"]
            }
          }
        ]
      : []
  });
  await chrome.action.setBadgeText({ text: enabled ? "" : "off" });
  await chrome.action.setBadgeBackgroundColor({ color: "#777777" });
}

async function sync() {
  await applyRedirectRule(await getState());
}

chrome.runtime.onInstalled.addListener(sync);
chrome.runtime.onStartup.addListener(sync);

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "sync" && (changes.targetHost || changes.enabled)) {
    await sync();
  }
});
