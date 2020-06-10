import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import initAnalytics from "./analytics";

let app;
let authUser;

const initializeFirebase = (analytics) =>
    chrome.storage.sync.get(
        { projectID: "", domain: "", apiKey: "", analytics: "" },
        (data) => {
            const projectID = data.projectID || "refdiff";
            app = firebase.initializeApp(
                {
                    projectId: projectID,
                    authDomain: data.domain || "refdiff.firebaseapp.com",
                    apiKey:
                        data.apiKey ||
                        "AIzaSyDIBgAmAXNdSZ_2jHMs9OxylexHitBnXIU",
                },
                projectID
            );

            if (analytics) {
                initAnalytics(data.analytics || "UA-35546390-8");
            }

            initializeAuth();
        }
    );

/**
 * Load settins and setup firebase
 */

const initializeAuth = () => {
    chrome.storage.sync.get(
        { projectID: "", email: "", password: "" },
        (data) => {
            if (data.projectID && data.email && data.password) {
                app.auth()
                    .signInWithEmailAndPassword(data.email, data.password)
                    .catch(console.error)
                    .then((data) => {
                        authUser = data.user;
                    });
            }

            app.auth().onAuthStateChanged((user) => {
                if (user) {
                    authUser = user;
                }
            });
        }
    );
};

chrome.runtime.onMessage.addListener(function (message, _, sendResponse) {
    switch (message.type) {
        case "refdiff-settings":
            initializeFirebase(false);
            sendResponse({ type: "success" });
            break;
        case "refdiff-login-status":
            chrome.storage.sync.get(
                {
                    email: "",
                    password: "",
                },
                (data) => {
                    if (!data.email || !data.password) {
                        sendResponse({ type: "loggedOut" });
                        return;
                    }

                    app.auth()
                        .signInWithEmailAndPassword(data.email, data.password)
                        .catch(function (error) {
                            sendResponse({ type: "loggedOut" });
                            console.log(error);
                        })
                        .then((data) => {
                            if (!data || !data.user) {
                                sendResponse({ type: "loggedOut" });
                                return;
                            }
                            sendResponse({ type: "loggedIn", user: data.user });
                            authUser = data.user;
                        });
                }
            );
            break;
        case "refdiff-login":
            chrome.storage.sync.get({ email: "", password: "" }, (data) => {
                if (!data.email || !data.password) {
                    sendResponse({
                        type: "loggedOut",
                        message: "Missing data!",
                    });
                    return;
                }

                app.auth()
                    .signInWithEmailAndPassword(data.email, data.password)
                    .catch(function (error) {
                        if (error.code === "auth/wrong-password") {
                            sendResponse({
                                type: "loggedOut",
                                message: "Wrong password.",
                            });
                        } else {
                            sendResponse({
                                type: "loggedOut",
                                message: error.message,
                            });
                        }
                    })
                    .then((data) => {
                        sendResponse({
                            type: "loggedIn",
                            message: data,
                        });
                        authUser = data.user;
                        ga("send", "event", "login");
                    });
            });
            break;
        case "refdiff-logout":
            chrome.storage.sync.set({
                email: "",
                password: "",
            });
            app.auth()
                .signOut()
                .then(() => {
                    authUser = null;
                    sendResponse({ type: "loggedOut" });
                })
                .catch((error) => {
                    console.error(error);
                });
            ga("send", "event", "logout");
            break;
    }
    return true;
});

const sendMessage = (data) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, data);
        return true;
    });
};

const regexCommit = new RegExp(
    /github\.com\/([\w_-]+)\/([\w_-]+)\/(?:pull\/\d+\/)?commits?\/(\w+)/
);

const regexPullRequest = new RegExp(
    /github\.com\/([\w_-]+)\/([\w_-]+)\/pull\/(\d+)/
);

const getDocIDFromURL = (url) => {
    let urlParts = regexCommit.exec(url);
    if (urlParts) {
        return `${urlParts[1]}/${urlParts[2]}/commit/${urlParts[3]}`;
    }

    urlParts = regexPullRequest.exec(url);
    if (urlParts) {
        return `${urlParts[1]}/${urlParts[2]}/pull/${urlParts[3]}`;
    }

    return false;
};

chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
    switch (request.command) {
        case "refdiff-refactoring":
            var docID = getDocIDFromURL(request.url);
            if (!docID) {
                sendResponse({});
                return;
            }

            app.firestore()
                .doc(docID)
                .get()
                .then((querySnapshot) => {
                    return querySnapshot.data();
                })
                .then((data) => {
                    if (data) {
                        ga("send", "pageview", "/" + docID);
                    }

                    sendMessage({
                        command: request.command,
                        data: data,
                        url: request.url,
                    });
                    sendResponse(data);
                })
                .catch((err) => {
                    console.error(err);
                    sendMessage({
                        command: request.command,
                        err: err || "firebase: error in fetch refatorings",
                        url: request.url,
                    });
                    sendResponse({});
                });
            break;
        case "event":
            ga(
                "send",
                "event",
                request.category,
                request.action,
                request.label,
                request.value
            );

            // TODO: remove afeter research experiment
            // Write operations only authorized for specific users
            if (authUser) {
                console.log({
                    category: request.category,
                    action: request.action,
                    label: request.label,
                    value: request.value,
                });
            }
    }
    return true;
});

// initialize firebase
initializeFirebase(true);
