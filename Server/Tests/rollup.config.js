export default {
    input: 'Tests/fableBuild/Main.js',
    output: {
        file: 'Tests/dist/bundle.js',
        format: 'cjs'
    },
    external: [
        'pg'
    ] // <-- suppresses the warning
};
