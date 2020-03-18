// Standard Google Universal Analytics code
(function(i, s, o, g, r, a, m) {
    i["GoogleAnalyticsObject"] = r;
    (i[r] =
        i[r] ||
        function() {
            (i[r].q = i[r].q || []).push(arguments);
        }),
        (i[r].l = 1 * new Date());
    (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
})(
    window,
    document,
    "script",
    "https://www.google-analytics.com/analytics.js",
    "ga"
);

ga("create", "UA-35546390-8", "auto");
ga("set", "checkProtocolTask", function() {}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga("require", "displayfeatures");
ga("send", "pageview", "/");

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (!changeInfo.url) {
        return;
    }

    fetchData(changeInfo.url, function(data) {
        chrome.tabs.sendMessage(tabId, {
            url: changeInfo.url,
            message: "data",
            data
        });
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.message) {
        case "fetch":
            fetchData(request.url, function(data) {
                chrome.tabs.query(
                    { active: true, currentWindow: true },
                    function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            url: request.url,
                            message: "data",
                            data
                        });
                    }
                );
            });
            break;
        case "event":
            ga("send", "event", request.category, request.action);
    }
});

function fetchData(url, callback) {
    const regex = /github\.com\/([\w_-]+)\/([\w_-]+)\/pull\/(\d+)/g;
    var urlParts = regex.exec(url);

    if (!urlParts) {
        return;
    }

    fetch(
        `https://refdiff.brito.com.br/${urlParts[1]}/${urlParts[2]}/${
            urlParts[3]
        }?t=${+new Date()}` // TODO remove seed
    )
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            callback(data);
        });
}
