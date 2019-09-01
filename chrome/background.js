// This background script is for adding the back to abstract button.
var app = {};
app.name = "[arXiv-utils]";
// Return the type parsed from the url.
app.getType = function (url) {
  if (url.endsWith(".pdf")) {
    return "PDF";
  }
  return "Abstract";
}
// Open the abstract page using the PDF URL.
app.openAbstractTab = function (activeTabIdx, url, type) {
  // Retrieve the abstract url by modifying the PDF url.
  var newURL;
  if (type === "PDF") {
    newURL = url.replace('.pdf', '').replace('pdf', 'abs');
  } else {
    newURL = url.replace('abs', 'pdf') + ".pdf";
  }
  // Create the abstract page in new tab.
  chrome.tabs.create({ "url": newURL }, (tab) => {
    console.log(app.name, "Opened abstract page in new tab.");
    // Move the target tab next to the active tab.
    chrome.tabs.move(tab.id, {
      index: activeTabIdx + 1
    }, function (tab) {
      console.log(app.name, "Moved abstract tab.");
    });
  });
}
// Check if the URL is abstract or PFD page.
app.checkURL = function (url) {
  var matchPDF = url.match(/arxiv.org\/pdf\/([\S]*)\.pdf$/);
  var matchAbs = url.match(/arxiv.org\/abs\/([\S]*)$/);
  if (matchPDF !== null || matchAbs !== null) {
    return true;
  }
  return false;
}
// Called when the url of a tab changes.
app.updateBrowserActionState = function (tabId, changeInfo, tab) {
  var avail = app.checkURL(tab.url)
  if (avail) {
    chrome.browserAction.enable(tabId);
  } else {
    chrome.browserAction.disable(tabId);
  }
  chrome.tabs.sendMessage(tabId, tab);
};
// Run this when the button clicked.
app.run = function (tab) {
  if (!app.checkURL(tab.url)) {
    console.log(app.name, "Error: Not arXiv page.");
    return;
  }
  var type = app.getType(tab.url);
  app.openAbstractTab(tab.index, tab.url, type);
}
// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(app.updateBrowserActionState);
// Extension button click to modify title.
chrome.browserAction.onClicked.addListener(app.run);
