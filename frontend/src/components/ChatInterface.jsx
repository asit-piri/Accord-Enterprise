import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { sendChatMessage } from "../api";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage(userMessage.content);
      const botMessage = { role: "assistant", content: response.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { role: "system", content: `Error: ${error}` };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        height: "650px",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        overflow: "hidden",
        border: "none",
        background: "rgba(255,255,255,0.85)",
      }}
    >
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          backgroundColor: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
            padding: "0.6rem",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 2px 8px rgba(0, 92, 153, 0.2)",
          }}
        >
          <Bot size={22} />
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "var(--text-main)",
            }}
          >
            NaviOwl Assistant
          </h3>
          <span
            style={{
              fontSize: "0.8rem",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                backgroundColor: "#16a34a",
                borderRadius: "50%",
                boxShadow: "0 0 0 2px rgba(22, 163, 74, 0.2)",
              }}
            ></span>
            Active Now
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "1.5rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          backgroundColor: "#fff",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "4rem",
              color: "var(--text-muted)",
            }}
          >
            <Sparkles
              size={48}
              style={{ margin: "0 auto 1rem", opacity: 0.2 }}
            />
            <p>Ready to answer your questions about the uploaded documents.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              gap: "1rem",
            }}
          >
            {msg.role !== "user" && (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor:
                    msg.role === "system" ? "#fee2e2" : "#f0f9ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: msg.role === "system" ? "#b91c1c" : "var(--primary)",
                }}
              >
                {msg.role === "system" ? (
                  <AlertCircle size={18} />
                ) : (
                  <Bot size={18} />
                )}
              </div>
            )}

            <div
              style={{
                maxWidth: "80%",
                padding: "1rem",
                borderRadius: "1rem",
                borderTopLeftRadius: msg.role === "assistant" ? 0 : "1rem",
                borderTopRightRadius: msg.role === "user" ? 0 : "1rem",
                backgroundColor:
                  msg.role === "user"
                    ? "var(--primary)"
                    : msg.role === "system"
                      ? "#fee2e2"
                      : "#f1f5f9",
                color:
                  msg.role === "user"
                    ? "white"
                    : msg.role === "system"
                      ? "#b91c1c"
                      : "var(--text-main)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>
            </div>

            {msg.role === "user" && (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "var(--text-muted)",
                }}
              >
                <User size={18} />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: "1rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "#f0f9ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <Bot size={18} />
            </div>
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#f1f5f9",
                borderRadius: "1rem",
                borderTopLeftRadius: 0,
              }}
            >
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        style={{
          padding: "1rem",
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#fff",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the documents..."
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim()}
          style={{ padding: "0.75rem" }}
        >
          <Send size={20} />
        </button>
      </form>

      <style>{`
        .typing-indicator span {
          display: inline-block;
          width: 6px;
          height: 6px;
          background-color: var(--text-muted);
          borderRadius: 50%;
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
