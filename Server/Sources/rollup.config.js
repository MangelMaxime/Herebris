export default {
    input: 'Sources/fableBuild/Main.js',
    output: {
        file: 'Sources/dist/bundle.js',
        format: 'cjs'
    },
    external: [
        'pg',
        'express'
    ] // <-- suppresses the warning
};
