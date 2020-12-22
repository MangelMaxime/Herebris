import React from 'react';
import ReactDOM from 'react-dom';
import { App } from "../fableBuild/Main.js";


ReactDOM.render(
    <React.StrictMode>
        <App Foo="Maxi3333m2242e" />
    </React.StrictMode>,
    document.getElementById('root'),
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
    import.meta.hot.accept();
}