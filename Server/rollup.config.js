export default {
    input: 'fableBuild/Main.js',
    output: {
        file: 'dist/bundle.js',
        format: 'cjs'
    },
    external: [
        'pg',
        'express'
    ] // <-- suppresses the warning
};
