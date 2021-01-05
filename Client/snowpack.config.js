/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    mount: {
        public: { url: '/', static: true },
        src: '/',
    },
    plugins: [
        '@snowpack/plugin-react-refresh',
        '@snowpack/plugin-dotenv',
        // ['@snowpack/plugin-run-script', {
        //     "cmd": "dotnet fable Sources/Herebris.Client.fsproj --outDir ./src/fableBuild",
        //     "watch": "dotnet fable watch Sources/Herebris.Client.fsproj --outDir ./src/fableBuild",
        //     "output": "stream"
        // }]

    ],
    install: [
        /* ... */
    ],
    installOptions: {
        /* ... */
    },
    devOptions: {
        /* ... */
        // output: "stream"
    },
    buildOptions: {
        /*  */
    },
    proxy: {
        "/api": "http://localhost:3000"
    },
    alias: {
        /* ... */
    },
};
