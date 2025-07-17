import React, { useState } from "react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleGenerate = async (type) => {
    setLoading(true);
    setError("");
    setCode("");
    setVideoUrl("");
    try {
      const endpoint =
        type === "video"
          ? "/generate?type=video"
          : "/generate";
      console.log("Sending request to:", endpoint, "with prompt:", prompt); // Debug log
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      console.log("Response status:", res.status, "Content-Type:", res.headers.get("content-type")); // Debug log

      if (!res.ok) throw new Error("Server error");

      if (type === "video") {
        // Expecting a video file (blob)
        const blob = await res.blob();
        if (blob.type.startsWith("video/")) {
          setVideoUrl(URL.createObjectURL(blob));
        } else {
          // Fallback: maybe error message as text
          const text = await blob.text();
          setError(text);
        }
      } else {
        // Expecting JSON or text with code
        const data = await res.json().catch(() => null);
        if (data && data.result) {
          setCode(data.result);
        } else {
          // Fallback: plain text
          const text = await res.text();
          setCode(text);
        }
      }
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Manim Animation App</h1>
        <textarea
          className="w-full border rounded p-2 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={4}
          placeholder="Describe your animation..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex gap-4 mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => handleGenerate("code")}
            disabled={loading || !prompt.trim()}
          >
            {loading ? "Generating..." : "Generate Code"}
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            onClick={() => handleGenerate("video")}
            disabled={loading || !prompt.trim()}
          >
            {loading ? "Generating..." : "Generate Video"}
          </button>
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
        )}
        {loading && (
          <div className="text-gray-500 mb-4">Processing your request...</div>
        )}
        {code && (
          <div>
            <h2 className="font-semibold mb-2">Generated Code:</h2>
            <pre className="bg-gray-900 text-green-200 p-4 rounded overflow-x-auto text-sm">
              {code}
            </pre>
          </div>
        )}
        {videoUrl && (
          <div>
            <h2 className="font-semibold mb-2">Generated Video:</h2>
            <video
              src={videoUrl}
              controls
              className="w-full rounded shadow"
            />
            <a
              href={videoUrl}
              download="manim_animation.mp4"
              className="block mt-2 text-blue-600 underline"
            >
              Download Video
            </a>
          </div>
        )}
      </div>
      <footer className="mt-8 text-gray-400 text-xs text-center">
        VIZDRE {new Date().getFullYear()}
      </footer>
    </div>
  );
}
