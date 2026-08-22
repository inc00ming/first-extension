const RULE_ID = 1;
const DEFAULT_HOST = "xcancel.com";

async function getTargetHost() {
  const { targetHost = DEFAULT_HOST } = await chrome.storage.sync.get("targetHost");
  return targetHost;
}

async function applyRedirectRule(host) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { transform: { host } }
        },
        condition: {
          urlFilter: "||x.com",
          resourceTypes: ["main_frame"]
        }
      }
    ]
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  await applyRedirectRule(await getTargetHost());
});

chrome.runtime.onStartup.addListener(async () => {
  await applyRedirectRule(await getTargetHost());
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "sync" && changes.targetHost) {
    await applyRedirectRule(changes.targetHost.newValue);
  }
});
