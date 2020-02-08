chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (!changeInfo.url) {
        return;
    }

    fetchData(changeInfo.url, function(data) {
        chrome.tabs.sendMessage(tabId, {
            message: "data",
            data
        });
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "fetch") {
        fetchData(request.url, function(data) {
            chrome.tabs.query({ active: true, currentWindow: true }, function(
                tabs
            ) {
                chrome.tabs.sendMessage(tabs[0].id, { message: "data", data });
            });
        });
    }
});

function fetchData(url, callback) {
    const regex = /github\.com\/([\w_-]+)\/([\w_-]+)\/pull\/(\d+)/g;
    var urlParts = regex.exec(url);

    if (!urlParts) {
        return;
    }

    fetch(
        `https://refdiff.brito.com.br/${urlParts[1]}/${urlParts[2]}/${urlParts[3]}`
    )
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            callback(data);
        });
}
