import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "./ChatApp.css"; // ✅ import CSS file here

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    message: "",
  });

  useEffect(() => {
    connect();
  }, []);

  let client = null;

  const connect = () => {
    const socket = new SockJS("http://localhost:8080/chat");

    client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe("/topic/messages", (msg) => {
          const message = JSON.parse(msg.body);
          setMessages((prev) => [...prev, message]);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    client.activate();
    window.stompClient = client; // optional global for debugging
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const sendMessage = () => {
    if (
      window.stompClient &&
      window.stompClient.connected &&
      userData.username &&
      userData.message.trim() !== ""
    ) {
      const chatMessage = {
        sender: userData.username,
        content: userData.message,
      };
      window.stompClient.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify(chatMessage),
      });
      setUserData((prev) => ({ ...prev, message: "" }));
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-heading">💬 Live Chat</h2>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${
              msg.sender === userData.username ? "my-message" : "other-message"
            }`}
          >
            <strong>{msg.sender}: </strong>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="chat-controls">
        <input
          type="text"
          name="username"
          placeholder="Your name"
          value={userData.username}
          onChange={handleInputChange}
          className="chat-input"
        />
        <input
          type="text"
          name="message"
          placeholder="Type a message..."
          value={userData.message}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="chat-input"
        />
        <button onClick={sendMessage} className="chat-button">
          Send
        </button>
      </div>

      {!connected && <p className="chat-connecting">Connecting...</p>}
    </div>
  );
};

export default ChatApp;
