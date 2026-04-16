(() => {
  if (window.top !== window) return;
  if (document.documentElement.hasAttribute("data-second-brain-button")) return;
  document.documentElement.setAttribute("data-second-brain-button", "1");

  const root = document.createElement("div");
  root.id = "second-brain-root";
  root.innerHTML = `
    <button id="second-brain-add-btn" type="button" title="Add to Brain">
      Add to Brain
    </button>
    <div id="second-brain-toast" aria-live="polite"></div>
  `;
  document.body.appendChild(root);

  const button = document.getElementById("second-brain-add-btn");
  const toast = document.getElementById("second-brain-toast");
  let timerId = null;

  const showToast = (message, isError = false) => {
    toast.textContent = message;
    toast.classList.toggle("error", isError);
    toast.classList.add("visible");
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      toast.classList.remove("visible");
    }, 2800);
  };

  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Saving...";

    try {
      const response = await chrome.runtime.sendMessage({ type: "save-active-tab" });
      if (!response?.ok) {
        showToast(response?.error || "Failed to save.", true);
      } else {
        showToast(`Saved: ${response.result.title}`);
      }
    } catch (error) {
      showToast(error.message || "Save failed.", true);
    } finally {
      button.disabled = false;
      button.textContent = "Add to Brain";
    }
  });
})();
