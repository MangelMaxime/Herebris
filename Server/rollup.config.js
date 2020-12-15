export default {
    input: 'fableBuild/Main.js',
    output: {
        file: 'dist/bundle.js',
        format: 'cjs'
    },
    external: ['pg'] // <-- suppresses the warning
};
