import UploadArea from "./components/UploadArea";
import ChatInterface from "./components/ChatInterface";
import "./index.css";

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <img src="/logo.png" alt="NaviOwl's" />
            <span>Intelligent Document Assistant</span>
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Intelligent Document Assistance
          </div>
        </div>
      </header>

      <main
        className="container fade-in"
        style={{ paddingBottom: "3rem", paddingTop: "2rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(300px, 1fr) 2fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            <section>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                Start Here
              </h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                Upload Documents to begin your analysis.
              </p>
              <UploadArea onUploadSuccess={() => { }} />
            </section>

            <div
              className="card"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                color: "white",
                border: "none",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Privacy Notice
              </h3>
              <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Document data is processed securely and is not stored
                permanently. All documents are cleared when the session ends.
              </p>
            </div>
          </div>

          <section style={{ height: "calc(100vh - 140px)" }}>
            <ChatInterface />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
