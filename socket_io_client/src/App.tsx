import React, { useState, useEffect, useRef } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import "./App.css";
import CryptoJS from "crypto-js";
const ENDPOINT = "http://127.0.0.1:4001";

function App() {
  let socket = useRef(socketIOClient.Socket); //TODO useref
  let key = useRef("");
  const [data, setData] = useState("");

  const generateRandomHexKey = (length: number): string => {
    let ret = "";
    while (ret.length < length) {
      ret += Math.random().toString(16).substring(2);
    }
    return ret.substring(0, length);
  };

  const encrypt = () => {};

  const decrypt = () => {};

  useEffect(() => {
    socket.current = socketIOClient(ENDPOINT);
    socket.current.on("connection", (data: any) => {
      console.log(data);
    });

    key.current = generateRandomHexKey(56);

    socket.current.on("new message", (data: any) => {
      setData(data);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const handleTextOnChange = (event: any) => {
    socket.current.emit("new message", event.target.value);
    setData(event.target.value);
  };

  return (
    <div className="appDiv">
      <div className="textareaDiv">
        <textarea
          className={"sharedData"}
          onChange={handleTextOnChange}
          value={data}
        ></textarea>
      </div>
    </div>
  );
}

export default App;
