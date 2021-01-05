import React from 'react';
import ReactDOM from 'react-dom';
import { App } from "./fableBuild/Main.js";
const Refresh = require('react-refresh/runtime');

console.log(Refresh);


window.Refresh = Refresh;


ReactDOM.render(
    <React.StrictMode>
        <App Foo="Something" />
    </React.StrictMode>,
    document.getElementById('root'),
);


if (module.hot) {
    module.hot.accept();
    // setTimeout(() => {
    //     Refresh.performReactRefresh();
    // }, 30);
}
