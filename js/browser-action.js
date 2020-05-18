window.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.querySelector(".bt-login");
    const logoutBtn = document.querySelector(".bt-logout");
    const refreshBtn = document.querySelector(".bt-refresh");
    const presentation = document.querySelector(".presentation");
    const userName = document.querySelector(".user-name");
    const messageBox = document.querySelector(".message-box");

    const githubLoggin = () => {
        chrome.runtime.sendMessage({ type: "refdiff-login" }, (response) => {
            if (response.type == "loggedIn") {
                presentation.classList.remove("is-hidden");
                loginBtn.classList.add("is-hidden");
                userName.textContent = response.user.displayName;
            }
            return true;
        });
    };

    const githubLoggout = () => {
        chrome.runtime.sendMessage({ type: "refdiff-logout" }, (response) => {
            if (response.type == "loggedOut") {
                presentation.classList.add("is-hidden");
                loginBtn.classList.remove("is-hidden");
            }
            return true;
        });
    };

    const refershRefactorings = () => {
        refreshBtn.classList.add("is-loading");
        chrome.tabs.getSelected(null, function (tab) {
            console.log("refresing ", tab.url);
            chrome.runtime.sendMessage(
                { command: "refdiff-refactoring", url: tab.url },
                (data) => {
                    const value =
                        data && data.refactorings && data.refactorings.length;
                    refreshBtn.classList.remove("is-loading");
                    messageBox.textContent = `${
                        value || 0
                    } refactorings found.`;
                    return true;
                }
            );
        });
    };

    loginBtn.addEventListener("click", githubLoggin);
    logoutBtn.addEventListener("click", githubLoggout);
    refreshBtn.addEventListener("click", refershRefactorings);

    chrome.runtime.sendMessage({ type: "refdiff-login-status" }, (response) => {
        if (response.type === "loggedIn") {
            presentation.classList.remove("is-hidden");
            loginBtn.classList.add("is-hidden");
            userName.textContent = response.user.displayName;
        } else if (response.type === "loggedOut") {
            presentation.classList.add("is-hidden");
            loginBtn.classList.remove("is-hidden");
        }
        return true;
    });
});
