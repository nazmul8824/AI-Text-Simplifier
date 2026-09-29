chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "CALL_SIMPLIFY_API") {
    fetch("http://127.0.0.1:8002/simplify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: message.text,
        mode: message.mode
      })
    })
      .then(response => response.json())
      .then(data => {
        sendResponse({ success: true, simplifiedText: data.simplified_text });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});