function loader(source) {
    const testCode = 'console.log("fast loader refresh");';

    return `${source} \n\n ${testCode}`;
}

module.exports = loader;
