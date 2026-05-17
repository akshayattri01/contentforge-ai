import { useState, useEffect } from "react";

const TYPES = [
  { value: "blog", label: "📝 Blog Post", prompt: "Write an engaging blog post about" },
  { value: "caption", label: "📸 Caption", prompt: "Write a viral social media caption about" },
  { value: "email", label: "📧 Email Copy", prompt: "Write a compelling marketing email about" },
  { value: "ad", label: "🎯 Ad Copy", prompt: "Write persuasive high-converting ad copy about" },
];

const TONES = ["Professional", "Casual", "Funny", "Inspirational", "Bold"];

const t = {
  generate: "Generate",
  topic: "Topic",
  tone: "Tone",
  type: "Content Type",
  placeholder: "What topic?",
  copy: "Copy",
  copied: "Copied!",
  loading: "Generating",
  output: "Output",
  error: "Please enter a topic first!",
};

export default function App() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("blog");
  const [tone, setTone] = useState("Professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(iv);
  }, [loading]);

  const generate = async () => {
    if (!topic.trim()) {
      setError(t.error);
      return;
    }

    setError("");
    setLoading(true);
    setOutput("");

    try {
      console.log("🔥 API CALL HIT FROM FRONTEND");
    const response = await fetch("https://contentforge-ai-93wd.onrender.com/api/ai/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    topic,
    type,
    tone,
  }),
});

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data?.message || "API request failed");
      }

      const text = data?.generatedContent;

      if (!text) {
        setOutput("❌ No content returned");
      } else {
        setOutput(text);
        const newItem = {
          topic, type, tone,
          output: text,
          date: new Date().toLocaleDateString(),
        };
        setHistory([newItem, ...history]);
      }
    } catch (err) {
      console.error(err);
      setOutput(`❌ Error: ${err.message}`);
    }

    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0e", color: "#fff", fontFamily: "Arial", padding: "20px" }}>
      <h1 style={{ marginBottom: 20 }}>⚡ ContentForge</h1>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h3>{t.type}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {TYPES.map((tp) => (
              <button key={tp.value} onClick={() => setType(tp.value)}
                style={{ padding: 10, borderRadius: 10, border: type === tp.value ? "2px solid #7c3aed" : "1px solid #444", background: type === tp.value ? "rgba(124,58,237,0.2)" : "#111", color: "#fff", cursor: "pointer" }}>
                {tp.label}
              </button>
            ))}
          </div>

          <h3 style={{ marginTop: 20 }}>{t.tone}</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {TONES.map((tn) => (
              <button key={tn} onClick={() => setTone(tn)}
                style={{ padding: "8px 14px", borderRadius: 20, border: tone === tn ? "2px solid #7c3aed" : "1px solid #444", background: tone === tn ? "rgba(124,58,237,0.2)" : "#111", color: "#fff", cursor: "pointer" }}>
                {tn}
              </button>
            ))}
          </div>

          <h3 style={{ marginTop: 20 }}>{t.topic}</h3>
          <textarea value={topic} onChange={(e) => { setTopic(e.target.value); setError(""); }}
            placeholder={t.placeholder}
            style={{ width: "100%", height: 120, background: "#111", border: error ? "2px solid red" : "1px solid #444", borderRadius: 10, padding: 12, color: "#fff", resize: "none", fontSize: 16 }} />

          {error && <div style={{ color: "red", marginTop: 5 }}>{error}</div>}

          <button onClick={generate} disabled={loading}
            style={{ width: "100%", marginTop: 15, padding: 14, borderRadius: 12, border: "none", background: "#7c3aed", color: "#fff", fontWeight: "bold", fontSize: 16, cursor: "pointer" }}>
            {loading ? `${t.loading}${dots}` : `⚡ ${t.generate}`}
          </button>
        </div>

        <div style={{ flex: 1, background: "#111", borderRadius: 12, padding: 15, minHeight: 400, border: "1px solid #333" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <h3>{t.output}</h3>
            {output && (
              <button onClick={copy}
                style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer" }}>
                {copied ? t.copied : t.copy}
              </button>
            )}
          </div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "#ddd" }}>
            {loading ? `${t.loading}${dots}` : output || "✨ Generated content will appear here"}
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3>📜 History</h3>
          {history.map((item, i) => (
            <div key={i} style={{ background: "#111", borderRadius: 10, padding: 15, marginBottom: 10, border: "1px solid #333" }}>
              <div style={{ color: "#7c3aed", fontWeight: "bold" }}>{item.topic} — {item.type} — {item.tone}</div>
              <div style={{ color: "#aaa", fontSize: 12, marginBottom: 5 }}>{item.date}</div>
              <div style={{ color: "#ddd", whiteSpace: "pre-wrap" }}>{item.output}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}