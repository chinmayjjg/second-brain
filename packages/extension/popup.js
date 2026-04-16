const STORAGE_KEYS = {
  API_BASE_URL: "sb_api_base_url",
  TOKEN: "sb_token",
  DEFAULT_BRAIN_ID: "sb_default_brain_id"
};

const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

const apiInput = document.getElementById("api-base-url");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const brainSelect = document.getElementById("brain-select");
const statusEl = document.getElementById("status");

const loginCard = document.getElementById("login-card");
const brainCard = document.getElementById("brain-card");
const saveNowBtn = document.getElementById("save-now-btn");
const logoutBtn = document.getElementById("logout-btn");

const setStatus = (message, isError = false) => {
  statusEl.textContent = message || "";
  statusEl.style.color = isError ? "#b91c1c" : "#1d4ed8";
};

function trimApiBaseUrl(url) {
  return (url || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

async function getStorage(keys) {
  return chrome.storage.sync.get(keys);
}

async function setStorage(values) {
  return chrome.storage.sync.set(values);
}

async function removeStorage(keys) {
  return chrome.storage.sync.remove(keys);
}

async function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const apiBaseUrl = trimApiBaseUrl(apiInput.value.trim());

  if (!email || !password) {
    setStatus("Email and password are required.", true);
    return;
  }

  setStatus("Logging in...");
  try {
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Login failed");
    }

    await setStorage({
      [STORAGE_KEYS.API_BASE_URL]: apiBaseUrl,
      [STORAGE_KEYS.TOKEN]: data.token
    });

    passwordInput.value = "";
    await refreshBrains(true);
    setStatus("Logged in successfully.");
  } catch (error) {
    setStatus(error.message || "Login failed.", true);
  }
}

async function fetchBrains() {
  const storage = await getStorage([STORAGE_KEYS.API_BASE_URL, STORAGE_KEYS.TOKEN]);
  const apiBaseUrl = trimApiBaseUrl(storage[STORAGE_KEYS.API_BASE_URL]);
  const token = storage[STORAGE_KEYS.TOKEN];

  if (!token) throw new Error("Not logged in.");

  const response = await fetch(`${apiBaseUrl}/brains`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch brains");
  }

  return data;
}

function populateBrainSelect(brains, selectedBrainId) {
  brainSelect.innerHTML = "";
  brains.forEach((brain) => {
    const option = document.createElement("option");
    option.value = brain._id;
    option.textContent = brain.name;
    if (brain._id === selectedBrainId) option.selected = true;
    brainSelect.appendChild(option);
  });
}

async function refreshBrains(autoSetDefault = false) {
  try {
    setStatus("Loading brains...");
    const [brains, storage] = await Promise.all([
      fetchBrains(),
      getStorage([STORAGE_KEYS.DEFAULT_BRAIN_ID])
    ]);

    if (!Array.isArray(brains) || brains.length === 0) {
      setStatus("No brains found. Create one in web app first.", true);
      return;
    }

    const savedBrainId = storage[STORAGE_KEYS.DEFAULT_BRAIN_ID];
    const firstBrainId = brains[0]._id;
    const brainId = savedBrainId || firstBrainId;

    populateBrainSelect(brains, brainId);

    if (autoSetDefault || !savedBrainId) {
      await setStorage({ [STORAGE_KEYS.DEFAULT_BRAIN_ID]: brainId });
    }

    showLoggedInState();
    setStatus("Brains loaded.");
  } catch (error) {
    showLoggedOutState();
    setStatus(error.message || "Failed to load brains.", true);
  }
}

async function saveDefaultBrain() {
  const brainId = brainSelect.value;
  if (!brainId) {
    setStatus("Please select a brain first.", true);
    return;
  }

  await setStorage({ [STORAGE_KEYS.DEFAULT_BRAIN_ID]: brainId });
  setStatus("Default brain saved.");
}

async function saveCurrentPage() {
  setStatus("Saving current page...");
  const response = await chrome.runtime.sendMessage({ type: "save-current-tab-from-popup" });
  if (!response?.ok) {
    setStatus(response?.error || "Failed to save page.", true);
    return;
  }
  setStatus(`Saved: ${response.result.title}`);
}

function showLoggedInState() {
  loginCard.classList.add("hidden");
  brainCard.classList.remove("hidden");
  saveNowBtn.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
}

function showLoggedOutState() {
  loginCard.classList.remove("hidden");
  brainCard.classList.add("hidden");
  saveNowBtn.classList.add("hidden");
  logoutBtn.classList.add("hidden");
}

async function init() {
  const storage = await getStorage([
    STORAGE_KEYS.API_BASE_URL,
    STORAGE_KEYS.TOKEN,
    STORAGE_KEYS.DEFAULT_BRAIN_ID
  ]);

  apiInput.value = storage[STORAGE_KEYS.API_BASE_URL] || DEFAULT_API_BASE_URL;

  if (storage[STORAGE_KEYS.TOKEN]) {
    await refreshBrains();
  } else {
    showLoggedOutState();
  }
}

document.getElementById("save-settings").addEventListener("click", async () => {
  const apiBaseUrl = trimApiBaseUrl(apiInput.value.trim());
  await setStorage({ [STORAGE_KEYS.API_BASE_URL]: apiBaseUrl });
  setStatus("Settings saved.");
});

document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("refresh-brains").addEventListener("click", () => refreshBrains());
document.getElementById("save-brain").addEventListener("click", saveDefaultBrain);
saveNowBtn.addEventListener("click", saveCurrentPage);

logoutBtn.addEventListener("click", async () => {
  await removeStorage([STORAGE_KEYS.TOKEN, STORAGE_KEYS.DEFAULT_BRAIN_ID]);
  showLoggedOutState();
  setStatus("Logged out.");
});

init();
