import React from 'react';
import ReactDOM from 'react-dom';
import { App } from "./fableBuild/Main.js";
import Test from './Test';


ReactDOM.render(
    <div>
        <App />
        <br/><br/><br/><br/>
        <Test/>
    </div>,
    document.getElementById('root'),
);

if (module.hot) {
    module.hot.accept();
}
