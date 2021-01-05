import React from 'react';
// const Refresh = require('react-refresh/runtime');

export function fakeFunction() {
    return "tes22t";
}

function Test() {
    return (
        <div className="App">
            <header className="App-header">
                <p>
                    Edit <code>src/App.js</code> and save to reload.2
                </p>
                `{fakeFunction()}`
            </header>
        </div>
    );
}

export default Test;
