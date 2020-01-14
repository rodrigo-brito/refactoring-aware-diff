window.addEventListener("load", function() {
    var popup = document.createElement("div");
    var baseLink = "#diff-8fceb9861aa1398ce0981de9a4427bdc";

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

    document
        .querySelectorAll(".code-review.blob-code.blob-code-deletion")
        .forEach(function(line) {
            if (line.querySelectorAll(`[data-line="4"]`).length === 0) {
                return;
            }

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
                    "Move Method",
                    moveMethodHTML,
                    "#diff-8fceb9861aa1398ce0981de9a4427bdcR34-R37"
                );
            });
            button.innerText = "R";
            line.appendChild(button);
        });

    document
        .querySelectorAll(".code-review.blob-code.blob-code-deletion")
        .forEach(function(line) {
            if (line.querySelectorAll(`[data-line="11"]`).length === 0) {
                return;
            }

            var button = document.createElement("button");
            button.setAttribute("class", "btn-refector");
            button.addEventListener("click", function() {
                var extractMethodDiff = `diff --git a/Example.java b/Example.java\nindex aa5aefd..36cbde8 100644\n--- a/Example.java\n+++ b/Example.java\n@@ -29,9 +18,26 @@ public class Example {\n+	public String Letters() {\n+		String result = "";\n+\n+		// letters\n+		result += "A";\n+		result += "B";\n+		result += "C";\n+		result += "D";\n+		result += "E";\n+\n+		return result;\n+	}`;
                var extractMethodHTML = Diff2Html.getPrettyHtml(
                    extractMethodDiff,
                    {
                        drawFileList: true,
                        matching: "lines"
                    }
                );

                console.log(extractMethodHTML);

                popup.showDiff(
                    button,
                    "Extract Method",
                    extractMethodHTML,
                    "#diff-8fceb9861aa1398ce0981de9a4427bdcR21-R32"
                );
            });
            button.innerText = "R";
            line.appendChild(button);
        });
});
