function getVisibleTextNodes(root = document.body) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;

        if (!parent) return NodeFilter.FILTER_REJECT;

        const tag = parent.tagName.toLowerCase();
        if (["script", "style", "noscript", "textarea"].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }

        const text = node.nodeValue.trim();
        if (!text) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodes = [];
  let current;

  while ((current = walker.nextNode())) {
    nodes.push(current);
  }

  return nodes;
}

function wrapSimplifiedNode(textNode, simplifiedText) {
  const span = document.createElement("span");
  span.className = "ai-simplified-node";
  span.dataset.originalText = textNode.nodeValue;
  span.textContent = simplifiedText;
  textNode.parentNode.replaceChild(span, textNode);
}

function restorePage() {
  const simplifiedNodes = document.querySelectorAll(".ai-simplified-node");

  simplifiedNodes.forEach(node => {
    const originalText = node.dataset.originalText || "";
    const textNode = document.createTextNode(originalText);
    node.parentNode.replaceChild(textNode, node);
  });

  const selectionNodes = document.querySelectorAll(".ai-simplified-selection");

  selectionNodes.forEach(node => {
    const originalText = node.dataset.originalText || "";
    const textNode = document.createTextNode(originalText);
    node.parentNode.replaceChild(textNode, node);
  });
}

function callSimplifyAPI(text, mode) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "CALL_SIMPLIFY_API",
        text,
        mode
      },
      response => {
        if (!response) {
          reject(new Error("No response from background script"));
          return;
        }

        if (response.success) {
          resolve(response.simplifiedText);
        } else {
          reject(new Error(response.error || "Unknown error"));
        }
      }
    );
  });
}

async function simplifySelectedText(mode) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    alert("Please select some text first.");
    return;
  }

  const selectedText = selection.toString().trim();

  if (!selectedText) {
    alert("Please select some text first.");
    return;
  }

  const simplifiedText = await callSimplifyAPI(selectedText, mode);

  const range = selection.getRangeAt(0);
  range.deleteContents();

  const span = document.createElement("span");
  span.className = "ai-simplified-selection";
  span.dataset.originalText = selectedText;
  span.textContent = simplifiedText;

  range.insertNode(span);

  selection.removeAllRanges();
}

async function simplifyFullPage(mode) {
  const textNodes = getVisibleTextNodes();

  for (const node of textNodes) {
    const originalText = node.nodeValue.trim();

    if (originalText.length < 40) {
      continue;
    }

    try {
      const simplifiedText = await callSimplifyAPI(originalText, mode);

      if (simplifiedText && simplifiedText !== originalText) {
        wrapSimplifiedNode(node, simplifiedText);
      }
    } catch (error) {
      console.error("Simplification failed:", error);
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SIMPLIFY_SELECTION") {
    simplifySelectedText(message.mode)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === "SIMPLIFY_PAGE") {
    simplifyFullPage(message.mode)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === "RESTORE_PAGE") {
    restorePage();
    sendResponse({ success: true });
  }
});