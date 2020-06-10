import * as diff2Html from "diff2html";
import * as Prism from "prismjs";

// language highlight
import "prismjs/components/prism-go";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-clike";

const ENV = "production";
// const ENV = "development";
const LEFT_SIDE = "left";
const RIGHT_SIDE = "right";

const fileMap = {};
const popup = document.createElement("div");

const debug = (value) => {
    if (ENV !== "development") {
        return;
    }
    console.log(value);
};

/**
 * Update global file map after url change
 */
const updateFileMap = () => {
    let changed = false;
    document.querySelectorAll(".file").forEach((file) => {
        const header = file.querySelector(".file-info > a");
        const fileName = header.textContent;
        const link = header.getAttribute("href");

        if (!fileMap[fileName]) {
            changed = true;
        }

        fileMap[fileName] = {
            ref: file,
            link: link,
        };
    });
    return changed;
};

/**
 * Register an event in analytics
 * @param {String} category
 * @param {String} action
 */
const sendEvent = (category, action, label, value) => {
    debug({
        category,
        action,
        label,
        value,
    });
    try {
        chrome.runtime.sendMessage({
            command: "event",
            category: category,
            action: action,
            label: label,
            value: value,
        });
    } catch (e) {
        console.error(e);
    }
};

/**
 * Message receiver to handle data
 */
chrome.runtime.onMessage.addListener(function (request) {
    switch (request.command) {
        case "refdiff-refactoring":
            // check if diff files are loaded and changed
            if (!updateFileMap()) {
                debug("no new files");
            }

            // no refactorings found
            if (!request.data || !request.data.refactorings) {
                return;
            }

            debug(
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
    const observer = new MutationObserver(function (mutationsList) {
        for (let mutation of mutationsList) {
            if (mutation.type === "childList") {
                clearTimeout(debounceObserver);
                debounceObserver = setTimeout(function () {
                    if (
                        !updateFileMap() &&
                        document.querySelector(".btn-refector")
                    ) {
                        debug("Files without change");
                        return;
                    }

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
    initObserver(["#js-repo-pjax-container"]);

    popup.setAttribute("class", "diff-refector-popup");
    popup.innerHTML = `
        <button class="diff-refector-action diff-refector-popup-close btn btn-sm btn-default">x</button>
        <button class="diff-refector-action diff-refector-popup-maximize btn btn-sm btn-default">⛶</button>
        <p><b class="refactor-type"></b></p>
        <div class="refactor-content"></div>
        <div class="refactor-diff-code"></div>
        <div class="d2h-wrapper refactor-diff-extration-wrapper">
            <div class="d2h-file-wrapper">
                <div class="d2h-file-header">
                    <span class="d2h-file-name-wrapper">
                        <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
                            <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
                        </svg>
                        <span class="d2h-file-name refactor-diff-extraction-name"></span>
                        <span class="d2h-tag d2h-moved d2h-extracted-tag">EXTRACT</span>
                    </span>
                </div>
                <div class="refactor-diff-extraction"></div>
            </div>
        </div>
        <a class="btn btn-sm btn-primary refactor-link" href="#">Go to source</a>
    `;

    popup.show = function (
        element,
        type,
        contentHTML,
        link,
        buttonText,
        side,
        diff
    ) {
        popup.querySelector(".refactor-content").innerHTML = contentHTML;
        popup.querySelector(".refactor-type").innerText = type;
        popup.querySelector(".refactor-diff-code").innerHTML = diff.code || "";
        popup.querySelector(
            ".refactor-diff-extraction"
        ).innerHTML = diff.extraction
            ? `<pre><code class="language-java">${diff.extraction}</code></pre>`
            : "";

        if (diff.extraction) {
            popup
                .querySelector(".refactor-diff-extration-wrapper")
                .style.setProperty("display", "block");

            popup.querySelector(".refactor-diff-extraction-name").innerText =
                diff.filename;
        } else {
            popup
                .querySelector(".refactor-diff-extration-wrapper")
                .style.setProperty("display", "none");
        }

        if (link) {
            const button = popup.querySelector(".refactor-link");
            button.setAttribute("href", link);
            button.textContent = buttonText;
            button.addEventListener("click", () => {
                sendEvent("click", "goto-side", side);
                sendEvent("click", "goto-type", type);
            });
        }

        popup.style.setProperty("display", "block");
        popup.style.setProperty("right", "auto");
        popup.style.setProperty("left", "auto");

        // pop-up offset to align box in left side
        const offset = popup.getBoundingClientRect().width + 10;

        const bounds = element.getBoundingClientRect();
        const left = (window.pageXOffset || element.scrollLeft) + bounds.left;
        const top = (window.pageYOffset || element.scrollTop) + bounds.top;

        // check if exists another open modal with unfinished time
        const lastTime = popup.getAttribute("data-time");
        if (lastTime) {
            const duration = Math.round((+new Date() - lastTime) / 100);
            sendEvent("duration", "type", type, duration);
            sendEvent("duration", "side", side, duration);
        }

        popup.style.setProperty("top", top + "px");
        popup.style.setProperty("left", Math.max(15, left - offset) + "px");
        popup.setAttribute("data-time", +new Date());
        popup.setAttribute("data-type", type);
        popup.setAttribute("data-side", side);
        popup.removeAttribute("data-left");
        popup.removeAttribute("data-right");

        sendEvent("click", "type", type);
        sendEvent("click", "side", side);
    };

    document.body.appendChild(popup);
    popup
        .querySelector(".diff-refector-popup-close")
        .addEventListener("click", () => {
            const type = popup.getAttribute("data-type");
            const side = popup.getAttribute("data-side");
            const openTime = Number(popup.getAttribute("data-time"));
            const duration = Math.round((+new Date() - openTime) / 100);

            popup.removeAttribute("data-time");
            popup.style.setProperty("display", "none");

            sendEvent("duration", "type", type, duration);
            sendEvent("duration", "side", side, duration);
        });

    popup
        .querySelector(".diff-refector-popup-maximize")
        .addEventListener("click", () => {
            const left = popup.getAttribute("data-left");
            const right = popup.getAttribute("data-right");

            if (left || right) {
                popup.style.setProperty("left", left);
                popup.style.setProperty("right", right);

                popup.removeAttribute("data-left");
                popup.removeAttribute("data-right");
            } else {
                popup.setAttribute(
                    "data-left",
                    popup.style.getPropertyValue("left")
                );
                popup.setAttribute(
                    "data-right",
                    popup.style.getPropertyValue("right")
                );

                popup.style.setProperty("left", "15px");
                popup.style.setProperty("right", "15px");
            }

            sendEvent("click", "maximize", popup.getAttribute("data-type"));
        });
});

/**
 *
 * @param {Object} fileMap pair of file and page anchor
 * @param {Object} refactoring refactoring data
 * @param {LEFT_SIDE|RIGHT_SIDE} side diff side
 */
const addRefactorings = (fileMap, refactoring, side) => {
    debug(side);
    debug(refactoring);
    const diff = {};
    if (refactoring.diff) {
        const afterFileName = refactoring.extraction
            ? refactoring.before_file_name
            : refactoring.after_file_name;

        diff.code = diff2Html.html(
            `--- a/${refactoring.before_file_name}\n+++ b/${afterFileName}\n${refactoring.diff}`,
            {
                drawFileList: false,
                outputFormat: "side-by-side",
            }
        );
    }

    if (refactoring.extraction) {
        diff.filename = refactoring.after_file_name;
        diff.extraction = Prism.highlight(
            refactoring.extraction,
            Prism.languages[refactoring.language || "clike"],
            refactoring.language || "clike"
        );
    }

    let beforeFile = fileMap[refactoring.before_file_name];
    let afterFile = fileMap[refactoring.after_file_name];

    if (!beforeFile || !afterFile) {
        return;
    }

    // right side (addiction)
    let lineNumber = refactoring.after_line_number;
    let buttonText = "Go to source";
    let baseFile = afterFile.ref;
    let link = `${beforeFile.link}L${refactoring.before_line_number}`;
    let selectorLineSufix = ".blob-num-addition";

    // left side (deletion)
    if (side === LEFT_SIDE) {
        lineNumber = refactoring.before_line_number;
        buttonText = "Go to target";
        baseFile = beforeFile.ref;
        link = `${afterFile.link}R${refactoring.after_line_number}`;
        selectorLineSufix = ".blob-num-deletion";
    }

    const iterator = (selectorLineSufix) => {
        return (line) => {
            if (
                !line.querySelector(
                    `[data-line-number="${lineNumber}"]${selectorLineSufix}`
                )
            ) {
                return false;
            }

            // avoid duplication, skip if found an anotation
            if (
                line.querySelector(
                    `[data-line-number="${lineNumber}"]${selectorLineSufix}~.blob-code .btn-refector`
                )
            ) {
                return true;
            }

            let contentHTML;
            let title = `${refactoring.type.replace("_", " ")} ${
                refactoring.object_type
            }`;
            switch (refactoring.type) {
                case "RENAME":
                    contentHTML = `<p><code>${refactoring.before_local_name}</code> renamed to <code>${refactoring.after_local_name}</code></p>`;
                    break;
                case "CHANGE_SIGNATURE":
                    contentHTML = "<p>Signature changed.</p>";
                    contentHTML += `<p>Before: <code>${refactoring.before_local_name}</code></p>`;
                    contentHTML += `<p>After: <code>${refactoring.after_local_name}</code></p>`;
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
                    }</code> in <code> ${
                        refactoring.after_local_name
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
            button.setAttribute(
                "class",
                `btn-refector ${
                    side === LEFT_SIDE
                        ? "btn-refactor-left"
                        : "btn-refactor-right"
                }`
            );
            button.addEventListener("click", () => {
                popup.show(
                    button,
                    title,
                    contentHTML,
                    link,
                    buttonText,
                    side,
                    diff
                );
            });
            button.innerText = "R";
            const sel = `[data-line-number="${lineNumber}"]${selectorLineSufix}~.blob-code`;
            const sides = line.querySelectorAll(sel);
            if (side == LEFT_SIDE) {
                sides[0].appendChild(button);
            } else {
                sides[sides.length - 1].appendChild(button);
            }

            return true;
        };
    };

    const found = Array.from(baseFile.querySelectorAll(".diff-table tr")).some(
        iterator(selectorLineSufix)
    );

    // fallback for lines without marks of addiction / deletion
    if (!found) {
        Array.from(baseFile.querySelectorAll(".diff-table tr")).some(
            iterator(".blob-num-context")
        );
    }
};
