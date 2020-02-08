var fileMap = {};
var popup = document.createElement("div");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.message) {
        case "data":
            console.log(request.data);
            request.data.refactorings.forEach(refactoring => {
                var file = fileMap[refactoring.after_file_name]; // TODO: change for before
                if (file) {
                    addRefactorings(file.ref, file.link, refactoring);
                } else {
                    console.error(
                        "not found reference for " + refactoring.after_file_name
                    );
                }
            });
            break;
        default:
            console.log("others: " + request);
    }
});

window.addEventListener("load", function() {
    popup.setAttribute("class", "diff-refector-popup");
    popup.innerHTML = `
        <button class="diff-refector-popup-close btn btn-sm btn-default">x</button>
        <p><b>Type:</b> <span class="refactor-type">Move Method</span></p>
        <div class="refactor-diff"></div>
        <a class="btn btn-sm btn-primary refactor-link" href="#">Go to block</a>
    `;

    popup.showDiff = function(element, type, diffHTML, interval) {
        popup.style.setProperty("display", "block");
        popup.querySelector(".refactor-diff").innerHTML = diffHTML;
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

    var files = document.querySelectorAll(".file");
    files.forEach(file => {
        var header = file.querySelector(".file-info > a");
        var fileName = header.textContent;
        var link = header.getAttribute("href");

        console.log("File=" + fileName + " Link=" + link);

        fileMap[fileName] = {
            ref: file,
            link: link
        };
    });

    chrome.runtime.sendMessage({
        message: "fetch",
        url: document.location.href
    });
});

function addRefactorings(file, link, refactoring) {
    console.log("adding refactoring for ", refactoring);
    console.log("REF = ", file);
    file.querySelectorAll(".code-review.blob-code.blob-code-deletion").forEach(
        function(line) {
            console.log("seraching for ", refactoring.before_line_number);
            if (
                !line.querySelector(
                    `[data-line="${refactoring.before_line_number}"]`
                )
            ) {
                return;
            }

            console.log("found line!!!!");

            var button = document.createElement("button");
            button.setAttribute("class", "btn-refector");
            button.addEventListener("click", function() {
                var moveMethodDiff = `diff --git a/Example.java b/Example.java\nindex aa5aefd..36cbde8 100644\n--- a/Example.java\n+++ b/Example.java\n@@ -1,20 +1,9 @@\n import java.io.*;\n \n public class Example {\n	public void DoNothing() {\n-		System.out.println("do nothing");\n+		System.out.println("do something");\n	}\n`;
                var moveMethodHTML = Diff2Html.getPrettyHtml(moveMethodDiff, {
                    drawFileList: true,
                    matching: "lines"
                });

                popup.showDiff(
                    button,
                    `${refactoring.type} - ${refactoring.object_type}`,
                    moveMethodHTML,
                    link
                );
            });
            button.innerText = "R";
            line.appendChild(button);
        }
    );
}
