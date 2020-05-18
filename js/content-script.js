import * as diff2Html from "diff2html";

const LEFT_SIDE = "left";
const RIGHT_SIDE = "right";

let fileMap = {};
let popup = document.createElement("div");

/**
 * Update global file map after url change
 */
const updateFileMap = () => {
    let files = document.querySelectorAll(".file");
    files.forEach((file) => {
        let header = file.querySelector(".file-info > a");
        let fileName = header.textContent;
        let link = header.getAttribute("href");

        fileMap[fileName] = {
            ref: file,

            link: link,
        };
    });
    return files.length > 0;
};

/**
 * Register an event in analytics
 * @param {String} category
 * @param {String} action
 */
const sendEvent = (category, action, value) => {
    chrome.runtime.sendMessage({
        command: "event",
        category: category,
        action: action,
        value: value,
    });
};

/**
 * Message receiver to handle data
 */
chrome.runtime.onMessage.addListener(function (request) {
    switch (request.command) {
        case "refdiff-refactoring":
            popup.style.setProperty("display", "none");

            // check if diff files are loaded
            if (!updateFileMap()) {
                return;
            }

            // no refactorings found
            if (!request.data || !request.data.refactorings) {
                return;
            }

            console.log(
                "Loading: " + request.data.refactorings.length + " refactorings"
            );
            request.data.refactorings.forEach((refactoring) => {
                addRefactorings(fileMap, refactoring, LEFT_SIDE);
                addRefactorings(fileMap, refactoring, RIGHT_SIDE);
            });
    }
});

var debounceObserver = null;
const debounceObserverTimeout = 100;

/**
 * Initialize observers to trigger plugin update
 * @param {Array} selectors list of CSS selectors to observe
 */
const initObserver = (selectors) => {
    console.log("observer init!");
    const observer = new MutationObserver(function (mutationsList) {
        for (let mutation of mutationsList) {
            if (mutation.type === "childList") {
                clearTimeout(debounceObserver);
                debounceObserver = setTimeout(function () {
                    console.log("Content changed!");

                    // request data from firebase
                    chrome.runtime.sendMessage({
                        command: "refdiff-refactoring",
                        url: document.location.href.split("#diff")[0],
                    });
                }, debounceObserverTimeout);
            }
        }
    });

    selectors.forEach((selector) => {
        const targetNode = document.querySelector(selector);
        observer.observe(targetNode, {
            attributes: false,
            childList: true,
            subtree: true,
        });
    });
};

/**
 * Plugin initialization after page load
 */
window.addEventListener("load", function () {
    console.log("filed loaded!!");
    initObserver(["#js-repo-pjax-container"]);

    popup.setAttribute("class", "diff-refector-popup");
    popup.innerHTML = `
        <button class="diff-refector-popup-close btn btn-sm btn-default">x</button>
        <p><b class="refactor-type"></b></p>
        <div class="refactor-content"></div>
        <div class="refactor-diff-box"></div>
        <a class="btn btn-sm btn-primary refactor-link" href="#">Go to source</a>
    `;

    popup.show = function (
        element,
        type,
        contentHTML,
        link,
        buttonText,
        side,
        gitDiff
    ) {
        popup.style.setProperty("display", "block");
        popup.querySelector(".refactor-content").innerHTML = contentHTML;
        popup.querySelector(".refactor-type").innerText = type;
        popup.querySelector(".refactor-diff-box").innerHTML = gitDiff || "";

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

        // check if exists another open modal with unfinished time
        const lastTime = popup.getAttribute("data-time");
        if (lastTime) {
            const duration = (+new Date() - lastTime) / 1000.0;
            sendEvent("duration-type", type, duration);
            sendEvent("duration-side", side, duration);
        }

        popup.style.setProperty("top", top + "px");
        popup.style.setProperty("left", left - offset + "px");
        popup.setAttribute("data-time", +new Date());
        popup.setAttribute("data-type", type);
        popup.setAttribute("data-side", side);

        sendEvent("open-type", type);
        sendEvent("open-side", side);
    };

    document.body.appendChild(popup);
    document
        .querySelector(".diff-refector-popup-close")
        .addEventListener("click", function () {
            const type = popup.getAttribute("data-type");
            const side = popup.getAttribute("data-side");
            const openTime = Number(popup.getAttribute("data-time"));
            const duration = (+new Date() - openTime) / 1000.0;

            popup.removeAttribute("data-time");
            sendEvent("duration-type", type, duration);
            sendEvent("duration-side", side, duration);
            popup.style.setProperty("display", "none");
        });
});

/**
 *
 * @param {Object} fileMap pair of file and page anchor
 * @param {Object} refactoring refactoring data
 * @param {LEFT_SIDE|RIGHT_SIDE} side diff side
 */
const addRefactorings = (fileMap, refactoring, side) => {
    let diffHTML;
    if (refactoring.diff) {
        diffHTML = diff2Html.html(
            `--- a/${refactoring.before_file_name}\n+++ b/${refactoring.after_file_name}\n${refactoring.diff}`,
            {
                drawFileList: false,
                outputFormat: "side-by-side",
            }
        );
    }

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

    baseFile.querySelectorAll(selector).forEach((line) => {
        if (
            !line.querySelector(`[data-line="${lineNumber}"]`) ||
            line.querySelector(".btn-refector")
        ) {
            return;
        }

        let contentHTML;
        let title = `${refactoring.type} ${refactoring.object_type}`;
        switch (refactoring.type) {
            case "RENAME":
                contentHTML = `<p><code>${refactoring.before_local_name}</code> renamed to <code>${refactoring.after_local_name}</code></p>`;
                break;
            case "MOVE":
            case "INTERNAL_MOVE":
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
            case "EXTRACT_MOVE":
                contentHTML = `<p>${refactoring.object_type.toLowerCase()} <code>${
                    refactoring.after_local_name
                }</code> extracted from <code>${refactoring.object_type.toLowerCase()} ${
                    refactoring.before_local_name
                }</code>.</p>`;
                contentHTML += `<p>Source: <code>${refactoring.before_file_name}:${refactoring.before_line_number}</code></p>`;
                contentHTML += `<p>Target: <code>${refactoring.after_file_name}:${refactoring.after_line_number}</code></p>`;
                break;
            case "INLINE":
                contentHTML = `<p>Inline function <code>${refactoring.object_type.toLowerCase()} ${
                    refactoring.before_local_name
                }</code> in <code> ${refactoring.after_local_name}</code>.</p>`;
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
            popup.show(
                button,
                title,
                contentHTML,
                link,
                buttonText,
                side,
                diffHTML
            );
        });
        button.innerText = "R";
        line.appendChild(button);
    });
};
