var fileMap = {};
var popup = document.createElement("div");
var currentPage = "";

function urlEqual(baseURL, reference) {
    return baseURL.split("#diff")[0] === reference.split("#diff")[0];
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.message) {
        case "data":
            if (urlEqual(request.url, currentPage)) {
                return;
            }
            currentPage = request.url.split("#diff")[0];

            var files = document.querySelectorAll(".file");
            files.forEach(file => {
                var header = file.querySelector(".file-info > a");
                var fileName = header.textContent;
                var link = header.getAttribute("href");

                fileMap[fileName] = {
                    ref: file,
                    link: link
                };
            });

            console.log("DATA = ", request.data);
            request.data.refactorings.forEach(refactoring => {
                var beforeFile = fileMap[refactoring.before_file_name];
                var afterFile = fileMap[refactoring.after_file_name];

                if (beforeFile && afterFile) {
                    addRefactorings(
                        beforeFile.ref,
                        `${afterFile.link}R${refactoring.after_line_number}`,
                        refactoring,
                        "L"
                    );

                    addRefactorings(
                        afterFile.ref,
                        `${beforeFile.link}L${refactoring.before_line_number}`,
                        refactoring,
                        "R"
                    );
                }
            });
    }
});

window.addEventListener("load", function() {
    popup.setAttribute("class", "diff-refector-popup");
    popup.innerHTML = `
        <button class="diff-refector-popup-close btn btn-sm btn-default">x</button>
        <p><b class="refactor-type"></b></p>
        <div class="refactor-content"></div>
        <a class="btn btn-sm btn-primary refactor-link" href="#">Go to source</a>
    `;

    popup.showDiff = function(element, type, diffHTML, interval) {
        popup.style.setProperty("display", "block");
        popup.querySelector(".refactor-content").innerHTML = diffHTML;
        popup.querySelector(".refactor-type").innerText = type;

        if (interval) {
            popup
                .querySelector(".refactor-link")
                .setAttribute("href", interval);
        }

        var offset = (popupPosition = popup.getBoundingClientRect().width) + 10;

        var pos = element.getBoundingClientRect();
        popup.style.setProperty("top", pos.top + "px");
        popup.style.setProperty("left", pos.left - offset + "px");
    };

    document.body.appendChild(popup);
    document
        .querySelector(".diff-refector-popup-close")
        .addEventListener("click", function() {
            popup.style.setProperty("display", "none");
        });

    chrome.runtime.sendMessage({
        message: "fetch",
        url: document.location.href.split("#diff")[0]
    });
});

function addRefactorings(file, link, refactoring, side) {
    console.log("adding refactoring for ", refactoring);

    // right side (addiction)
    var lineNumber = refactoring.after_line_number;
    var selector = ".code-review.blob-code.blob-code-addition";

    // left side (deletion)
    if (side === "L") {
        lineNumber = refactoring.before_line_number;
        selector = ".code-review.blob-code.blob-code-deletion";
    }

    file.querySelectorAll(selector).forEach(line => {
        if (!line.querySelector(`[data-line="${lineNumber}"]`)) {
            return;
        }

        var contentHTML;
        switch (refactoring.type) {
            case "RENAME":
                contentHTML = `<p><code>${refactoring.before_local_name}</code> to <code>${refactoring.after_local_name}</code></p>`;
                break;
            case "MOVE":
                contentHTML = `<p><code>${refactoring.before_local_name}</code> moved.</p>`;
                contentHTML += `<p>Origin: <code>${refactoring.before_file_name}:${refactoring.before_line_number}</code></p>`;
                contentHTML += `<p>Destiny: <code>${refactoring.after_file_name}:${refactoring.after_line_number}</code></p>`;
                break;
            default:
                contentHTML = `<p>${refactoring.type}: ${refactoring.object_type} <code>${refactoring.before_local_name}</code></p>`;
                contentHTML += `<p>Origin: <code>${refactoring.before_file_name}:${refactoring.before_line_number}</code></p>`;
                contentHTML += `<p>Destiny: <code>${refactoring.after_file_name}:${refactoring.after_line_number}</code></p>`;
        }

        var button = document.createElement("button");
        button.setAttribute("class", "btn-refector");
        button.addEventListener("click", () => {
            popup.showDiff(
                button,
                `${refactoring.type} ${refactoring.object_type}`,
                contentHTML,
                link
            );
        });
        button.innerText = "R";
        line.appendChild(button);
    });
}
