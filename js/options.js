document.addEventListener("DOMContentLoaded", () => {
    const projectID = document.getElementById("project-id");
    const domain = document.getElementById("domain");
    const apiKey = document.getElementById("api-key");
    const analytics = document.getElementById("analytics");
    const button = document.getElementById("save");
    const message = document.getElementById("message");

    button.addEventListener("click", () => {
        button.classList.add("is-loading");
        console.log(projectID.value);
        chrome.storage.sync.set(
            {
                projectID: projectID.value,
                domain: domain.value,
                apiKey: apiKey.value,
                analytics: analytics.value,
            },
            () => {
                button.classList.remove("is-loading");
                message.innerText = "Saved successfully!";
            }
        );
    });

    chrome.storage.sync.get(
        {
            projectID: "",
            domain: "",
            apiKey: "",
            analytics: "",
        },
        function (items) {
            projectID.value = items.projectID || "";
            domain.value = items.domain || "";
            apiKey.value = items.apiKey || "";
            analytics.value = items.analytics || "";
        }
    );
});
