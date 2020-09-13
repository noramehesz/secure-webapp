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
    return crypto.randomBytes(length); // use randomBytes() to get randrom values with the given length
  };

  // encrypt the data, each with a new IV (16 byte long) in CFB mode without padding
  // and use HmacSHA1 for integrity protection
  const encryptData = (data: any) => {
    const iv = generateRandomHexKeyorIV(16).toString("hex");
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
    if (CryptoJS.HmacSHA1(ciphertext, key.current).toString() !== auth_tag) {
      //check auth_tag, problem occurres when the key or the auth_tag in the encrypted message is wrong
      return "error while decrypting the data";
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
      // do nothing
    });

    if (window.location.pathname === "/receiver/") {
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
    key.current = generateRandomHexKeyorIV(32).toString("hex"); //generate a 256 bit long random key
    setUrlToKey(`localhost:3000/receiver/#${key.current}`);
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
                <p className="urlToName">{urlToKey}</p>
              </div>
            )}
          </Route>
          <Route path={"/receiver"}>
            <p className="labelForSharedData"> SHARED DATA </p>
            <div className="receiverDiv">
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
