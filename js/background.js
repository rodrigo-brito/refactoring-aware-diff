import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import initAnalytics from "./analytics";

// Init Google Analytics
initAnalytics();

/**
 * Google Analytics
 */
const firebaseConfig = {
    apiKey: "AIzaSyDIBgAmAXNdSZ_2jHMs9OxylexHitBnXIU",
    authDomain: "refdiff.firebaseapp.com",
    projectId: "refdiff",
};

firebase.initializeApp(firebaseConfig);
let authUser = firebase.auth().currentUser;
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        authUser = user;
    }
});

const db = firebase.firestore();
chrome.windows.onCreated.addListener(() => {
    firebase.auth().currentUser;
});

chrome.runtime.onMessage.addListener(function (message, _, sendResponse) {
    switch (message.type) {
        case "refdiff-login-status":
            if (authUser) {
                sendResponse({ type: "loggedIn", user: authUser });
            } else {
                sendResponse({ type: "loggedOut" });
            }
            break;
        case "refdiff-login":
            var provider = new firebase.auth.GithubAuthProvider();
            provider.addScope("user");

            var auth = firebase.auth();
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            auth.signInWithPopup(provider)
                .then((response) => {
                    sendResponse({ type: "loggedIn", user: response.user });
                })
                .catch((error) => {
                    console.error(error);
                });
            ga("send", "event", "login");
            break;
        case "refdiff-logout":
            firebase
                .auth()
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

            db.doc(docID)
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
    }
    return true;
});
