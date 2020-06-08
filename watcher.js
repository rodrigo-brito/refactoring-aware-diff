const Bundler = require("parcel-bundler");
const open = require("open");

const entryFiles = [
    "./js/content-script.js",
    "./js/background.js",
    "./js/browser-action.js",
    "./js/options.js",
];

const options = {
    outDir: "js/build/",
    watch: true,
    cache: true,
    cacheDir: ".cache",
    scopeHoist: false,
    target: "browser",
    hmr: false,
    sourceMaps: false,
    detailedReport: true,
};

(async function () {
    const bundler = new Bundler(entryFiles, options);
    bundler.on("buildEnd", () => {
        console.log("Refreshing extensions");
        open("http://reload.extensions");
    });
    const bundle = await bundler.bundle();
})();
