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
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        ga("send", "event", "login");
    }
});

const db = firebase.firestore();
chrome.windows.onCreated.addListener(function () {
    firebase.auth().currentUser;
});

chrome.runtime.onMessage.addListener(function (message, _, sendResponse) {
    switch (message.type) {
        case "refdiff-login-status":
            var user = firebase.auth().currentUser;
            if (user) {
                sendResponse({ type: "loggedIn", user: user });
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
                .then(function (response) {
                    sendResponse({ type: "loggedIn", user: response.user });
                })
                .catch(function (error) {
                    console.error(error);
                });
            break;
        case "refdiff-logout":
            firebase
                .auth()
                .signOut()
                .then(function () {
                    sendResponse({ type: "loggedOut" });
                })
                .catch(function (error) {
                    console.error(error);
                });
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
                        // register view in diff refactoring
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
                request.value
            );
    }
    return true;
});
