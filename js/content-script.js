const LEFT_SIDE = "left";
const RIGHT_SIDE = "right";

let fileMap = {};
let popup = document.createElement("div");
let currentPage = "";

/**
 * Check if Github URLs are equal
 * @param {String} baseURL
 * @param {String} reference
 */
function urlEqual(baseURL, reference) {
    return baseURL.split("#diff")[0] === reference.split("#diff")[0];
}

/**
 * Update global file map after url change
 */
function updateFileMap() {
    let files = document.querySelectorAll(".file");
    files.forEach(file => {
        let header = file.querySelector(".file-info > a");
        let fileName = header.textContent;
        let link = header.getAttribute("href");

        fileMap[fileName] = {
            ref: file,
            link: link
        };
    });
    return files.length > 0;
}

/**
 * Register an event in analytics
 * @param {String} category
 * @param {String} action
 */
function sendEvent(category, action) {
    chrome.runtime.sendMessage({
        message: "event",
        category: category,
        action: action
    });
}

/**
 * Message receiver to handle data
 */
chrome.runtime.onMessage.addListener(function(request) {
    let delayToUpdate = 0;
    switch (request.message) {
        case "data":
            if (urlEqual(request.url, currentPage)) {
                return;
            }

            popup.style.setProperty("display", "none");
            currentPage = request.url.split("#diff")[0];

            // check if diff files are loaded
            if (!updateFileMap()) {
                delayToUpdate = 2000; // 1 sec.
            }

            setTimeout(() => {
                if (delayToUpdate > 0) {
                    updateFileMap();
                }

                // avoid insert duplication with delayed requests
                if (document.querySelector(".btn-refector")) {
                    return;
                }

                request.data.refactorings.forEach(refactoring => {
                    addRefactorings(fileMap, refactoring, LEFT_SIDE);
                    addRefactorings(fileMap, refactoring, RIGHT_SIDE);
                });
            }, delayToUpdate);
    }
});

/**
 * Plugin initialization after page load
 */
window.addEventListener("load", function() {
    popup.setAttribute("class", "diff-refector-popup");
    popup.innerHTML = `
        <button class="diff-refector-popup-close btn btn-sm btn-default">x</button>
        <p><b class="refactor-type"></b></p>
        <div class="refactor-content"></div>
        <a class="btn btn-sm btn-primary refactor-link" href="#">Go to source</a>
    `;

    popup.show = function(element, type, diffHTML, link, buttonText) {
        popup.style.setProperty("display", "block");
        popup.querySelector(".refactor-content").innerHTML = diffHTML;
        popup.querySelector(".refactor-type").innerText = type;

        if (link) {
            let button = popup.querySelector(".refactor-link");
            button.setAttribute("href", link);
            button.textContent = buttonText;
        }

        // pop-up offset to align box in left side
        let offset = popup.getBoundingClientRect().width + 10;

        let bounds = element.getBoundingClientRect();
        let left = (window.pageXOffset || element.scrollLeft) + bounds.left;
        let top = (window.pageYOffset || element.scrollTop) + bounds.top;

        popup.style.setProperty("top", top + "px");
        popup.style.setProperty("left", left - offset + "px");

        sendEvent("open", type);
    };

    document.body.appendChild(popup);
    document
        .querySelector(".diff-refector-popup-close")
        .addEventListener("click", function() {
            popup.style.setProperty("display", "none");
        });

    // Request background task refactorings
    chrome.runtime.sendMessage({
        message: "fetch",
        url: document.location.href.split("#diff")[0]
    });
});

/**
 *
 * @param {Object} fileMap pair of file and page anchor
 * @param {Object} refactoring refactoring data
 * @param {LEFT_SIDE|RIGHT_SIDE} side diff side
 */
function addRefactorings(fileMap, refactoring, side) {
    let beforeFile = fileMap[refactoring.before_file_name];
    let afterFile = fileMap[refactoring.after_file_name];

    if (!beforeFile || !afterFile) {
        return;
    }

    // right side (addiction)
    let lineNumber = refactoring.after_line_number;
    let selector = ".blob-code.blob-code-addition";
    let buttonText = "Go to source";
    let baseFile = afterFile.ref;
    let link = `${beforeFile.link}L${refactoring.before_line_number}`;

    // left side (deletion)
    if (side === LEFT_SIDE) {
        lineNumber = refactoring.before_line_number;
        selector = ".blob-code.blob-code-deletion";
        buttonText = "Go to target";
        baseFile = beforeFile.ref;
        link = `${afterFile.link}R${refactoring.after_line_number}`;
    }

    baseFile.querySelectorAll(selector).forEach(line => {
        if (!line.querySelector(`[data-line="${lineNumber}"]`)) {
            return;
        }

        let contentHTML;
        let title = `${refactoring.type} ${refactoring.object_type}`;
        switch (refactoring.type) {
            case "RENAME":
                contentHTML = `<p><code>${refactoring.before_local_name}</code> renamed to <code>${refactoring.after_local_name}</code></p>`;
                break;
            case "MOVE":
                contentHTML = `<p><code>${refactoring.object_type.toLowerCase()} ${
                    refactoring.before_local_name
                }</code> moved.</p>`;
                contentHTML += `<p>Source: <code>${refactoring.before_file_name}:${refactoring.before_line_number}</code></p>`;
                contentHTML += `<p>Target: <code>${refactoring.after_file_name}:${refactoring.after_line_number}</code></p>`;
                break;
            case "EXTRACT_SUPER":
                title = "EXTRACT " + refactoring.object_type.toUpperCase();
                contentHTML = `<p>${refactoring.object_type.toLowerCase()} <code> ${
                    refactoring.after_local_name
                }</code> extracted from class <code>${
                    refactoring.before_local_name
                }</code>.</p>`;
                contentHTML += `<p>Source: <code>${refactoring.before_file_name}:${refactoring.before_line_number}</code></p>`;
                contentHTML += `<p>Target: <code>${refactoring.after_file_name}:${refactoring.after_line_number}</code></p>`;
                break;
            case "EXTRACT":
                contentHTML = `<p>${refactoring.object_type.toLowerCase()} <code>${
                    refactoring.after_local_name
                }</code> extracted from <code>${refactoring.object_type.toLowerCase()} ${
                    refactoring.before_local_name
                }</code>.</p>`;
                contentHTML += `<p>Source: <code>${refactoring.before_file_name}:${refactoring.before_line_number}</code></p>`;
                contentHTML += `<p>Target: <code>${refactoring.after_file_name}:${refactoring.after_line_number}</code></p>`;
                break;
            default:
                refactoring.type = refactoring.type.replace("_", " ");
                title = `${refactoring.type} ${refactoring.object_type}`;
                contentHTML = `<p>${
                    refactoring.type
                }: ${refactoring.object_type.toLowerCase()} <code>${
                    refactoring.before_local_name
                }</code></p>`;
                contentHTML += `<p>Source: <code>${refactoring.before_file_name}:${refactoring.before_line_number}</code></p>`;
                contentHTML += `<p>Target: <code>${refactoring.after_file_name}:${refactoring.after_line_number}</code></p>`;
        }

        let button = document.createElement("button");
        button.setAttribute("class", "btn-refector");
        button.addEventListener("click", () => {
            popup.show(button, title, contentHTML, link, buttonText);
        });
        button.innerText = "R";
        line.appendChild(button);
    });
}
