import React from "react";
import ChatApp from "./components/ChatApp";
import "./App.css";

function App() {
  return (
    <div className="app-wrapper">
      {/* Animated star particles */}
      <div className="particles">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
          }} />
        ))}
      </div>
      <ChatApp />
    </div>
  );
}

export default App;
