// src/components/PromptForm.jsx
import { useState } from "react";

export default function PromptForm() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("code"); // "code" | "video"

  const handleGenerateCode = async () => {
    setLoading(true);
    setOutput("");
    setVideoURL("");
    try {
      const res = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        // Try to parse error JSON; fallback to text
        if (contentType.includes("application/json")) {
          const errJson = await res.json();
          setOutput(`Error: ${errJson.error || JSON.stringify(errJson)}`);
        } else {
          const errText = await res.text();
          setOutput(`Error: ${errText}`);
        }
        return;
      }

      if (contentType.includes("application/json")) {
        const data = await res.json();
        setOutput(data.result || "No output");
      } else {
        const text = await res.text();
        setOutput(text || "No output");
      }
    } catch (err) {
      setOutput("Error: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    setLoading(true);
    setOutput("");
    setVideoURL("");
    try {
      const res = await fetch("http://localhost:5000/generate?type=video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const errJson = await res.json();
          setOutput(`Error: ${errJson.error || JSON.stringify(errJson)}`);
        } else {
          const errText = await res.text();
          setOutput(`Error: ${errText}`);
        }
        return;
      }

      // Expecting video/mp4; create a blob URL
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
      setOutput("Video generated.");
    } catch (err) {
      setOutput("Error: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setOutput("Please enter a prompt.");
      return;
    }
    if (mode === "code") {
      await handleGenerateCode();
    } else {
      await handleGenerateVideo();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded ${
              mode === "code" ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-200"
            }`}
            onClick={() => setMode("code")}
            disabled={loading}
          >
            Code
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded ${
              mode === "video" ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-200"
            }`}
            onClick={() => setMode("video")}
            disabled={loading}
          >
            Video
          </button>
        </div>

        <textarea
          className="w-full h-32 p-3 rounded border border-slate-700 bg-slate-800 text-gray-100 placeholder-gray-400"
          placeholder="Describe your animation..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />

        <div className="flex gap-3">
          <button
            type="submit"
            className={`px-4 py-2 rounded ${
              loading ? "bg-slate-600" : mode === "code" ? "bg-blue-600 hover:bg-blue-700" : "bg-teal-600 hover:bg-teal-700"
            } text-white`}
            disabled={loading}
            title={mode === "code" ? "Generate Code" : "Generate Video"}
          >
            {loading ? "Processing..." : mode === "code" ? "Generate Code" : "Generate Video"}
          </button>

          {mode === "code" && (
            <button
              type="button"
              className="px-3 py-2 rounded bg-slate-700 text-gray-200"
              onClick={() => {
                setPrompt("");
                setOutput("");
                setVideoURL("");
              }}
              disabled={loading}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      <div className="mt-6">
        {videoURL ? (
          <div className="space-y-2">
            <video src={videoURL} controls className="w-full rounded border border-slate-700" />
            <div className="text-sm text-gray-300">
              If you want to save the file, right-click the video and choose Save video as.
            </div>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap bg-slate-900 text-gray-100 p-3 rounded border border-slate-800 min-h-24">
            {output || "Output will appear here."}
          </pre>
        )}
      </div>
    </div>
  );
}
