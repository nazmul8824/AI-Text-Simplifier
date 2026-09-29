const modeSelect = document.getElementById("mode");
const simplifySelectionBtn = document.getElementById("simplifySelection");
const simplifyPageBtn = document.getElementById("simplifyPage");
const restorePageBtn = document.getElementById("restorePage");
const statusText = document.getElementById("status");

function setStatus(message) {
  statusText.textContent = message;
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function sendMessageToTab(message) {
  const tab = await getActiveTab();
  return chrome.tabs.sendMessage(tab.id, message);
}

simplifySelectionBtn.addEventListener("click", async () => {
  try {
    setStatus("Simplifying selected text...");
    const mode = modeSelect.value;

    await sendMessageToTab({
      action: "SIMPLIFY_SELECTION",
      mode
    });

    setStatus("Done.");
  } catch (error) {
    setStatus("Error: " + error.message);
  }
});

simplifyPageBtn.addEventListener("click", async () => {
  try {
    setStatus("Simplifying full page...");
    const mode = modeSelect.value;

    await sendMessageToTab({
      action: "SIMPLIFY_PAGE",
      mode
    });

    setStatus("Done.");
  } catch (error) {
    setStatus("Error: " + error.message);
  }
});

restorePageBtn.addEventListener("click", async () => {
  try {
    setStatus("Restoring original text...");
    await sendMessageToTab({
      action: "RESTORE_PAGE"
    });

    setStatus("Restored.");
  } catch (error) {
    setStatus("Error: " + error.message);
  }
});