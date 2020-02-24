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
}

/**
 * Message receiver to handle data
 */
chrome.runtime.onMessage.addListener(function(request) {
    switch (request.message) {
        case "data":
            if (urlEqual(request.url, currentPage)) {
                return;
            }
            currentPage = request.url.split("#diff")[0];
            updateFileMap();

            request.data.refactorings.forEach(refactoring => {
                addRefactorings(fileMap, refactoring, LEFT_SIDE);
                addRefactorings(fileMap, refactoring, RIGHT_SIDE);
            });
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

    // right side (addiction)
    let lineNumber = refactoring.after_line_number;
    let selector = ".blob-code.blob-code-addition";
    let link = `${beforeFile.link}L${refactoring.before_line_number}`;
    let buttonText = "Go to source";
    let baseFile = afterFile.ref;

    // left side (deletion)
    if (side === LEFT_SIDE) {
        lineNumber = refactoring.before_line_number;
        selector = ".blob-code.blob-code-deletion";
        link = `${afterFile.link}R${refactoring.after_line_number}`;
        buttonText = "Go to target";
        baseFile = beforeFile.ref;
    }

    baseFile.querySelectorAll(selector).forEach(line => {
        if (!line.querySelector(`[data-line="${lineNumber}"]`)) {
            return;
        }

        let contentHTML;
        switch (refactoring.type) {
            case "RENAME":
                contentHTML = `<p><code>${refactoring.before_local_name}</code> to <code>${refactoring.after_local_name}</code></p>`;
                break;
            case "MOVE":
                contentHTML = `<p><code>${refactoring.before_local_name}</code> moved.</p>`;
                contentHTML += `<p>Source: <code>${refactoring.before_file_name}:${refactoring.before_line_number}</code></p>`;
                contentHTML += `<p>Target: <code>${refactoring.after_file_name}:${refactoring.after_line_number}</code></p>`;
                break;
            default:
                contentHTML = `<p>${refactoring.type}: ${refactoring.object_type} <code>${refactoring.before_local_name}</code></p>`;
                contentHTML += `<p>Source: <code>${refactoring.before_file_name}:${refactoring.before_line_number}</code></p>`;
                contentHTML += `<p>Target: <code>${refactoring.after_file_name}:${refactoring.after_line_number}</code></p>`;
        }

        let button = document.createElement("button");
        button.setAttribute("class", "btn-refector");
        button.addEventListener("click", () => {
            popup.show(
                button,
                `${refactoring.type} ${refactoring.object_type}`,
                contentHTML,
                link,
                buttonText
            );
        });
        button.innerText = "R";
        line.appendChild(button);
    });
}
