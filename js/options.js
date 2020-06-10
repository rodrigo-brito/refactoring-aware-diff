document.addEventListener("DOMContentLoaded", () => {
    const projectID = document.getElementById("project-id");
    const domain = document.getElementById("domain");
    const apiKey = document.getElementById("api-key");
    const analytics = document.getElementById("analytics");
    const saveButton = document.getElementById("save");
    const saveMessage = document.getElementById("message-save");

    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const loginButton = document.getElementById("login");
    const loginMessage = document.getElementById("message-login");

    saveButton.addEventListener("click", () => {
        saveButton.classList.add("is-loading");
        chrome.storage.sync.set(
            {
                projectID: projectID.value,
                domain: domain.value,
                apiKey: apiKey.value,
                analytics: analytics.value,
            },
            () => {
                chrome.runtime.sendMessage({ type: "refdiff-settings" }, () => {
                    saveButton.classList.remove("is-loading");
                    saveMessage.innerText = "Saved successfully!";
                });
            }
        );
    });

    loginButton.addEventListener("click", () => {
        loginButton.classList.add("is-loading");
        chrome.storage.sync.set(
            {
                email: email.value,
                password: password.value,
            },
            () => {
                chrome.runtime.sendMessage(
                    { type: "refdiff-login" },
                    (response) => {
                        loginButton.classList.remove("is-loading");
                        if (response.type == "loggedIn") {
                            loginMessage.innerText = "Saved successfully!";
                        } else {
                            loginMessage.innerText = response.message;
                        }
                        return true;
                    }
                );
            }
        );
    });

    chrome.storage.sync.get(
        {
            projectID: "",
            domain: "",
            apiKey: "",
            analytics: "",
            email: "",
            password: "",
        },
        function (data) {
            projectID.value = data.projectID || "";
            domain.value = data.domain || "";
            apiKey.value = data.apiKey || "";
            analytics.value = data.analytics || "";
            email.value = data.email || "";
            password.value = data.password || "";
        }
    );
});
