import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElement = document.createElement("div");
rootElement.id = "react-chrome-app";

document.body?.appendChild(rootElement);
// const target = (document.getElementsByClassName('nH ar4 z'));
// console.log(target);
// const target = (document.getElementsByClassName('ar4')[0]);
// target!.append(rootElement);
// target!.prepend(rootElement);
// document.body.appendChild(globalStyles);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
