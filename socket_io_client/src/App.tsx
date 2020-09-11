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
import crypto from "crypto";
const ENDPOINT = "http://127.0.0.1:4001";

function App() {
  let socket = useRef(socketIOClient.Socket);
  let key = useRef("");
  const [data, setData] = useState("");
  let [sessionExists, setSessionExists] = useState(false);
  const [urlToKey, setUrlToKey] = useState("");

  const generateRandomHexKeyorIV = (length: number): Buffer => {
    return crypto.randomBytes(length);
  };

  const encryptData = (data: any) => {
    const iv = generateRandomHexKeyorIV(16).toString("hex"); // new iv for every message
    const encrypted = CryptoJS.AES.encrypt(data, key.current, {
      mode: CryptoJS.mode.CFB,
      iv: iv,
    }).toString();
    const auth_tag = CryptoJS.HmacSHA1(encrypted, key.current).toString();
    return iv + encrypted + auth_tag;
  };

  const decryptData = (data: any) => {
    const iv = data.slice(0, 32);
    const ciphertext = data.slice(32, -40);
    const auth_tag = data.slice(-40);
    console.log(auth_tag);
    if (CryptoJS.HmacSHA1(ciphertext, key.current).toString() !== auth_tag) {
      return "error with auth";
    } else {
      const decrypted = CryptoJS.AES.decrypt(ciphertext, key.current, {
        mode: CryptoJS.mode.CFB,
        iv: iv,
      }).toString(CryptoJS.enc.Utf8);
      return decrypted;
    }
  };

  useEffect(() => {
    socket.current = socketIOClient(ENDPOINT);
    socket.current.on("connection", (data: any) => {
      console.log(data);
    });

    if (window.location.pathname === "/reciever/") {
      key.current = window.location.hash.slice(1);
      console.log(`reciever key ${key.current}`);
      window.history.replaceState(
        null,
        document.title,
        window.location.pathname
      );
      socket.current.emit("session is ready");
      setSessionExists(true);
    }

    socket.current.on("new message", (data: any) => {
      setData(decryptData(data));
    });

    socket.current.on("session is ready", () => {
      setSessionExists(true);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const handleTextOnChange = (event: any) => {
    socket.current.emit("new message", encryptData(event.target.value));
    setData(event.target.value);
  };

  const handleCreateNewSessOnClick = (event: any) => {
    key.current = generateRandomHexKeyorIV(32).toString("hex");
    setUrlToKey(`localhost:3000/reciever/#${key.current}`);
  };

  return (
    <div className="appDiv">
      <Router>
        <Switch>
          <Route path={"/sender"}>
            <div className="textareaDiv">
              <span className="labelAboveInput">WRITE YOUR TEXT HERE</span>
              <input
                type="text"
                className={"sharedData"}
                onChange={handleTextOnChange}
                value={data}
                disabled={!sessionExists}
              ></input>
            </div>
            {!sessionExists && (
              <div className="createSession">
                <div className="buttonDiv">
                  <button
                    onClick={handleCreateNewSessOnClick}
                    className="sessionButton"
                  >
                    Create new session
                  </button>
                </div>
                <p>{urlToKey}</p>
              </div>
            )}
          </Route>
          <Route path={"/reciever"}>
            <p className="labelForSharedData"> SHARED DATA </p>
            <div className="recieverDiv">
              <h1 className="recievedData">{data}</h1>
            </div>
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
