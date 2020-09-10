import React, { useState, useEffect, useRef } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import CryptoJS from "crypto-js";
const ENDPOINT = "http://127.0.0.1:4001";

function App() {
  let socket = useRef(socketIOClient.Socket);
  let key = useRef("");
  const [data, setData] = useState("");
  let [sessionExists, setSessionExists] = useState(false);
  const [urlToKey, setUrlToKey] = useState("");

  const generateRandomHexKey = (length: number): string => {
    let ret = "";
    while (ret.length < length) {
      ret += Math.random().toString(16).substring(2);
    }
    return ret.substring(0, length);
  };

  const encryptData = (data: any) => {};

  const decryptData = (data: any) => {};

  useEffect(() => {
    socket.current = socketIOClient(ENDPOINT);
    socket.current.on("connection", (data: any) => {
      console.log(data);
    });

    if (window.location.pathname === "/reciever/") {
      key.current = window.location.hash.slice(1);
      window.history.replaceState(
        null,
        document.title,
        window.location.pathname
      );
      socket.current.emit("session is ready");
      setSessionExists(true);
    }

    socket.current.on("new message", (data: any) => {
      setData(data);
      decryptData(data);
    });

    socket.current.on("session is ready", () => {
      setSessionExists(true);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const handleTextOnChange = (event: any) => {
    const data = encryptData(event.target.value);
    socket.current.emit("new message", data);
    setData(event.target.value);
  };

  const handleCreateNewSessOnClick = (event: any) => {
    key.current = generateRandomHexKey(56);
    setUrlToKey(`localhost:3000/reciever/#${key.current}`);
  };

  return (
    <div className="appDiv">
      <Router>
        <Switch>
          <Route path={"/sender"}>
            <div className="textareaDiv">
              <textarea
                className={"sharedData"}
                onChange={handleTextOnChange}
                value={data}
                disabled={!sessionExists}
              ></textarea>
            </div>
            {!sessionExists && (
              <div className="buttonDiv">
                <button onClick={handleCreateNewSessOnClick}>
                  Create new session
                </button>
                <p>{urlToKey}</p>
              </div>
            )}
          </Route>
          <Route path={"/reciever"}>
            <p> You are the reciever </p>
            <h1>{data}</h1>
          </Route>
          <Route path={"/"}>
            <Redirect to={"/sender"}></Redirect>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
