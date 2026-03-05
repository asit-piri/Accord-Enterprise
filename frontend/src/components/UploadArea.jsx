import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadFiles } from "../api";

const UploadArea = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      setError(null);
      setSuccess(false);

      try {
        const result = await uploadFiles(acceptedFiles);
        setSuccess(true);
        onUploadSuccess();
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err);
      } finally {
        setUploading(false);
      }
    },
    [onUploadSuccess],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  return (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? "active" : ""}`}
        style={{
          border: "2px dashed #94a3b8",
          borderRadius: "var(--radius-lg)",
          padding: "4rem 2rem",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          backgroundColor: isDragActive
            ? "rgba(0, 92, 153, 0.05)"
            : "rgba(255,255,255,0.4)",
          borderColor: isDragActive ? "var(--primary)" : "#94a3b8",
        }}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="loading"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Loader2
                className="animate-spin"
                size={56}
                color="var(--primary)"
              />
              <p
                style={{
                  marginTop: "1.5rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                Analyzing documents...
              </p>
            </motion.div>
          ) : success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              key="success"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  background: "#dcfce7",
                  borderRadius: "50%",
                  marginBottom: "1rem",
                }}
              >
                <CheckCircle size={48} color="#16a34a" />
              </div>
              <p
                style={{
                  color: "#166534",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                Documents processed successfully!
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="idle"
            >
              <div
                style={{
                  backgroundColor: "rgba(0, 92, 153, 0.08)",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem auto",
                  transition: "transform 0.3s ease",
                }}
              >
                <Upload size={40} color="var(--primary)" />
              </div>
              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                  color: "var(--primary-dark)",
                }}
              >
                Upload Your Documents
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  marginBottom: "2rem",
                  maxWidth: "300px",
                  margin: "0 auto 2rem auto",
                }}
              >
                Drag and drop Documents here, or click to browse.
              </p>
              <span
                className="btn btn-primary"
                style={{ pointerEvents: "none" }}
              >
                Select PDF Files
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#fee2e2",
            borderRadius: "var(--radius-sm)",
            color: "#b91c1c",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};

export default UploadArea;
