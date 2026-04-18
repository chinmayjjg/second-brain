const STORAGE_KEYS = {
  API_BASE_URL: "sb_api_base_url",
  TOKEN: "sb_token",
  DEFAULT_BRAIN_ID: "sb_default_brain_id"
};

const DEFAULT_API_BASE_URL = "https://second-brain-7mvv.onrender.com/api";
const LEGACY_LOCAL_API_BASE_URL = "http://localhost:5000/api";

function getStorage(keys) {
  return chrome.storage.sync.get(keys);
}

function setStorage(data) {
  return chrome.storage.sync.set(data);
}

function trimApiBaseUrl(apiBaseUrl) {
  if (!apiBaseUrl) return DEFAULT_API_BASE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
}

function getApiBaseUrlCandidates(apiBaseUrl) {
  const normalizedUrl = trimApiBaseUrl(apiBaseUrl);
  const candidates = [normalizedUrl];

  if (normalizedUrl.includes("://localhost")) {
    candidates.push(normalizedUrl.replace("://localhost", "://127.0.0.1"));
  } else if (normalizedUrl.includes("://127.0.0.1")) {
    candidates.push(normalizedUrl.replace("://127.0.0.1", "://localhost"));
  }

  return [...new Set(candidates)];
}

async function probeApiBaseUrl(apiBaseUrl) {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/me`, { method: "GET" });
    return response.status === 401 || response.ok;
  } catch (_error) {
    return false;
  }
}

async function resolveApiBaseUrl(apiBaseUrl) {
  const candidates = getApiBaseUrlCandidates(apiBaseUrl);

  for (const candidate of candidates) {
    const isReachable = await probeApiBaseUrl(candidate);
    if (isReachable) {
      return candidate;
    }
  }

  throw new Error(
    `Cannot reach the API at ${candidates.join(" or ")}. Start the backend server and make sure it is running on port 5000.`
  );
}

function inferType(url, title, textContent) {
  const value = `${url} ${title} ${textContent}`.toLowerCase();
  if (/youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com/.test(value)) {
    return "video";
  }
  if (/blog|medium\.com|dev\.to|hashnode|substack|news|article/.test(value)) {
    return "article";
  }
  if ((textContent || "").length > 350) {
    return "note";
  }
  return "link";
}

function extractTags(url, title) {
  const tags = [];

  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (hostname) tags.push(hostname);
  } catch (_error) {
    // Ignore invalid URLs and continue.
  }

  const lowerTitle = (title || "").toLowerCase();
  if (lowerTitle.includes("tutorial")) tags.push("tutorial");
  if (lowerTitle.includes("design")) tags.push("design");
  if (lowerTitle.includes("ai")) tags.push("ai");
  if (lowerTitle.includes("javascript")) tags.push("javascript");

  return [...new Set(tags)].slice(0, 5);
}

async function scrapeTab(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const getMeta = (query, attr = "content") =>
        document.querySelector(query)?.getAttribute(attr)?.trim() || "";

      const title =
        document.title ||
        getMeta("meta[property='og:title']") ||
        "Untitled";
      const description =
        getMeta("meta[name='description']") ||
        getMeta("meta[property='og:description']");
      const selectedText = window.getSelection?.().toString().trim() || "";
      const articleText = document.querySelector("article")?.innerText?.trim() || "";
      const content = (selectedText || articleText || "").slice(0, 5000);

      return {
        title,
        description: description.slice(0, 500),
        content,
        url: window.location.href
      };
    }
  });

  return results?.[0]?.result || null;
}

async function createItemFromTab(tabId) {
  const [storage, tab] = await Promise.all([
    getStorage([
      STORAGE_KEYS.API_BASE_URL,
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.DEFAULT_BRAIN_ID
    ]),
    chrome.tabs.get(tabId)
  ]);

  const apiBaseUrl = await resolveApiBaseUrl(storage[STORAGE_KEYS.API_BASE_URL]);
  const token = storage[STORAGE_KEYS.TOKEN];
  const brainId = storage[STORAGE_KEYS.DEFAULT_BRAIN_ID];

  if (!token) {
    throw new Error("Please login in the extension popup first.");
  }
  if (!brainId) {
    throw new Error("Please select a default brain in the popup.");
  }

  const scraped = await scrapeTab(tabId);
  if (!scraped || !scraped.url) {
    throw new Error("Unable to read this page. Try a normal website tab.");
  }

  const type = inferType(scraped.url, scraped.title, scraped.content);
  const payload = {
    title: scraped.title || tab.title || "Untitled",
    url: scraped.url,
    content: scraped.content,
    description: scraped.description,
    type,
    tags: extractTags(scraped.url, scraped.title),
    brainId
  };

  const response = await fetch(`${apiBaseUrl}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let message = `Failed to save item (${response.status})`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
      if (Array.isArray(data?.errors) && data.errors.length) {
        message = data.errors[0].msg || message;
      }
    } catch (_error) {
      // Keep fallback error message.
    }
    throw new Error(message);
  }

  const item = await response.json();
  return {
    itemId: item._id,
    title: item.title,
    type: item.type
  };
}

async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("No active tab found.");
  }
  return tab.id;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "save-active-tab") {
    (async () => {
      try {
        const tabId = sender.tab?.id || (await getActiveTabId());
        const result = await createItemFromTab(tabId);
        sendResponse({ ok: true, result });
      } catch (error) {
        sendResponse({ ok: false, error: error.message || "Unknown error" });
      }
    })();
    return true;
  }

  if (message?.type === "save-current-tab-from-popup") {
    (async () => {
      try {
        const tabId = await getActiveTabId();
        const result = await createItemFromTab(tabId);
        sendResponse({ ok: true, result });
      } catch (error) {
        sendResponse({ ok: false, error: error.message || "Unknown error" });
      }
    })();
    return true;
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const current = await getStorage([STORAGE_KEYS.API_BASE_URL]);
  const storedApiBaseUrl = trimApiBaseUrl(current[STORAGE_KEYS.API_BASE_URL]);

  if (!storedApiBaseUrl || storedApiBaseUrl === LEGACY_LOCAL_API_BASE_URL) {
    await setStorage({ [STORAGE_KEYS.API_BASE_URL]: DEFAULT_API_BASE_URL });
  }
});
