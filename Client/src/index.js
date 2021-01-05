import React from 'react';
import ReactDOM from 'react-dom';
import { App } from "./fableBuild/Main.js";


ReactDOM.render(
    <React.StrictMode>
        <App Foo="Something" />
    </React.StrictMode>,
    document.getElementById('root'),
);


// if (module.hot) {
//     module.hot.accept();
// }
