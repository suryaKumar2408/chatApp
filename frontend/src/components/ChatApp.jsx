import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "./ChatApp.css";

const QUICK_EMOJIS = ["👋", "😄", "🔥", "❤️", "👍", "😂"];

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    message: "",
  });
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);

  const stompClientRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    connect();
    return () => {
      if (window.stompClient) {
        window.stompClient.deactivate();
        window.stompClient = null;
        setConnected(false);
      }
    };
  }, []);

  const connect = () => {
    const backendUrl = "https://chatapp-backend-n0tc.onrender.com";
    const socket = new SockJS(`${backendUrl}/chat`);

    stompClientRef.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        console.log("Connected to backend ✅");

        stompClientRef.current.subscribe("/topic/messages", (msg) => {
          const message = JSON.parse(msg.body);
          message.timestamp = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          setMessages((prev) => [...prev, message]);
        });
      },
      onDisconnect: () => {
        console.log("Disconnected ❌");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    stompClientRef.current.activate();
    window.stompClient = stompClientRef.current;
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

  const sendQuickEmoji = (emoji) => {
    if (
      window.stompClient &&
      window.stompClient.connected &&
      userData.username
    ) {
      const chatMessage = {
        sender: userData.username,
        content: emoji,
      };
      window.stompClient.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify(chatMessage),
      });
    }
  };

  const handleJoin = () => {
    if (userData.username.trim()) {
      setTransitioning(true);
      setTimeout(() => {
        setJoined(true);
        setTransitioning(false);
      }, 500);
    }
  };

  const handleLeave = () => {
    setTransitioning(true);
    setTimeout(() => {
      setJoined(false);
      setTransitioning(false);
    }, 500);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const getAvatarIndex = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 8;
  };

  // Hero / Welcome Screen
  if (!joined) {
    return (
      <div className={`hero-container ${transitioning ? "fade-out" : ""}`}>
        <div className="hero-glow" />
        <div className="hero-card">
          {/* Animated gradient border */}
          <div className="hero-card-border" />

          <div className="hero-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="hero-title">
            <span className="shimmer-text">ChatApp</span>
          </h1>
          <p className="hero-tagline">
            Connect instantly. Chat in real-time with anyone, anywhere.
          </p>

          <div className="hero-features">
            <div className="hero-feature">
              <span className="feature-icon">⚡</span>
              <span>Real-time</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">🔒</span>
              <span>Secure</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">🌍</span>
              <span>Global</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">✨</span>
              <span>Beautiful</span>
            </div>
          </div>

          <div className="hero-join">
            <div className="hero-input-wrapper">
              <svg
                className="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                name="username"
                placeholder="Enter your name..."
                value={userData.username}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="hero-input"
                autoFocus
              />
            </div>
            <button
              onClick={handleJoin}
              className="hero-button"
              disabled={!userData.username.trim()}
            >
              <span>Join Chat</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <div className="hero-status">
            <span
              className={`status-dot ${connected ? "online" : "connecting"}`}
            />
            <span className="status-text">
              {connected
                ? "Server online — Ready to chat"
                : "Connecting to server..."}
            </span>
          </div>
        </div>

        {/* Decorative floating badges */}
        <div className="floating-badge badge-1">💬</div>
        <div className="floating-badge badge-2">🚀</div>
        <div className="floating-badge badge-3">✨</div>
      </div>
    );
  }

  // Chat Screen
  return (
    <div className={`chat-container ${transitioning ? "fade-out" : "fade-in"}`}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="back-button" onClick={handleLeave} title="Leave chat">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="chat-header-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="chat-title">Live Chat</h2>
            <span className="chat-subtitle">
              Chatting as <strong>{userData.username}</strong>
            </span>
          </div>
        </div>
        <div className="chat-header-right">
          <span
            className={`status-dot ${connected ? "online" : "connecting"}`}
          />
          <span className="header-status-text">
            {connected ? "Online" : "Reconnecting..."}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-box" ref={chatBoxRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="empty-illustration">
              <div className="empty-bubble bubble-1">Hi! 👋</div>
              <div className="empty-bubble bubble-2">Hey there!</div>
              <div className="empty-bubble bubble-3">Let's chat!</div>
            </div>
            <p className="empty-text">No messages yet</p>
            <p className="empty-hint">Send a message or tap an emoji below to start the conversation!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isOwn = msg.sender === userData.username;
          const isEmoji =
            msg.content.length <= 4 &&
            /^[\p{Emoji}]+$/u.test(msg.content);
          const showSender =
            !isOwn &&
            (i === 0 || messages[i - 1].sender !== msg.sender);

          return (
            <div
              key={i}
              className={`message-row ${isOwn ? "own" : "other"}`}
              style={{ "--msg-delay": `${Math.min(i * 0.05, 0.5)}s` }}
            >
              {!isOwn && (
                <div
                  className={`message-avatar avatar-color-${getAvatarIndex(msg.sender)}`}
                  title={msg.sender}
                >
                  {getInitial(msg.sender)}
                </div>
              )}
              <div
                className={`message-bubble ${isOwn ? "own" : "other"} ${isEmoji ? "emoji-message" : ""
                  }`}
              >
                {showSender && (
                  <span className="message-sender">{msg.sender}</span>
                )}
                <p className={`message-content ${isEmoji ? "emoji-big" : ""}`}>
                  {msg.content}
                </p>
                <span className="message-time">{msg.timestamp || "now"}</span>
              </div>
              {isOwn && (
                <div
                  className={`message-avatar avatar-color-${getAvatarIndex(msg.sender)}`}
                  title={msg.sender}
                >
                  {getInitial(msg.sender)}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Bar */}
      <div className="quick-emoji-bar">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            className="quick-emoji-btn"
            onClick={() => sendQuickEmoji(emoji)}
            title={`Send ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <input
          type="text"
          name="message"
          placeholder="Type a message..."
          value={userData.message}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="chat-input"
          autoFocus
        />
        <button
          onClick={sendMessage}
          className="chat-send-button"
          disabled={!userData.message.trim()}
          title="Send message"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
