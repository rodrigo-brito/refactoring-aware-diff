parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"PcvC":[function(require,module,exports) {
window.addEventListener("DOMContentLoaded",function(){var e=document.querySelector(".bt-login"),t=document.querySelector(".bt-logout"),n=document.querySelector(".bt-refresh"),s=document.querySelector(".presentation"),i=document.querySelector(".user-name"),r=document.querySelector(".message-box");e.addEventListener("click",function(){chrome.runtime.sendMessage({type:"refdiff-login"},function(t){return"loggedIn"==t.type&&(s.classList.remove("is-hidden"),e.classList.add("is-hidden"),i.textContent=t.user.displayName),!0})}),t.addEventListener("click",function(){chrome.runtime.sendMessage({type:"refdiff-logout"},function(t){return"loggedOut"==t.type&&(s.classList.add("is-hidden"),e.classList.remove("is-hidden")),!0})}),n.addEventListener("click",function(){n.classList.add("is-loading"),chrome.tabs.getSelected(null,function(e){console.log("refresing ",e.url),chrome.runtime.sendMessage({command:"refdiff-refactoring",url:e.url},function(e){var t=e&&e.refactorings&&e.refactorings.length;return n.classList.remove("is-loading"),r.textContent="".concat(t||0," refactorings found."),!0})})}),chrome.runtime.sendMessage({type:"refdiff-login-status"},function(t){return"loggedIn"===t.type?(s.classList.remove("is-hidden"),e.classList.add("is-hidden"),i.textContent=t.user.displayName):"loggedOut"===t.type&&(s.classList.add("is-hidden"),e.classList.remove("is-hidden")),!0})});
},{}]},{},["PcvC"], null)