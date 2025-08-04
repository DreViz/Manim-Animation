import React, { useState } from "react";
import './index.css'; 

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
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (type === "video") {
        const blob = await res.blob();
        if (blob.type.startsWith("video/")) {
          setVideoUrl(URL.createObjectURL(blob));
        } else {
          setError(await blob.text() || "Server error");
        }
      } else {
        if (!res.ok) throw new Error("Server error");
        const data = await res.json().catch(() => null);
        setCode(data?.result || await res.text());
      }
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen">
      <section className="mt-12 lg:mt-24">
        <div className="bg-teal-500 text-white -skew-y-1">
          <div className="container mx-auto skew-y-1">
            <div className="flex flex-col items-center py-10 text-center lg:py-20">
              <div className="w-full px-4 lg:w-1/2 lg:px-0">
                <div className="mb-8">
                  <h2 className="text-3xl lg:text-4xl font-light mb-3">
                    Manim Animation Generator
                  </h2>
                  <p className="text-lg lg:text-xl opacity-80">
                    Describe your animation and let AI generate the code or video!
                  </p>
                </div>

                {/* --- This is the new Search Bar section --- */}
                <div className="w-full mb-6">
                  <form action="#" method="GET" onSubmit={(e) => e.preventDefault()}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                          viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z">
                          </path>
                        </svg>
                      </div>
                      <input
                        type="search"
                        name="search"
                        placeholder="Describe your animation..."
                        className="p-4 pl-10 text-gray-800 rounded-lg w-full border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-teal-400"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>
                  </form>
                </div>

                <div className="flex gap-4 mb-8 justify-center">
                  <button
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                    onClick={() => handleGenerate("code")}
                    disabled={loading || !prompt.trim()}
                  >
                    {loading ? "Generating..." : "Generate Code"}
                  </button>
                  <button
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                    onClick={() => handleGenerate("video")}
                    disabled={loading || !prompt.trim()}
                  >
                    {loading ? "Generating..." : "Generate Video"}
                  </button>
                </div>

                <div className="w-full text-left">
                  {error && <div className="bg-red-200 text-red-800 p-3 rounded mb-4">{error}</div>}
                  {loading && <div className="text-gray-100 mb-4 text-center">Processing...</div>}
                  {code && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-xl mb-2 text-white">Generated Code:</h3>
                      <pre className="bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{code}</code>
                      </pre>
                    </div>
                  )}
                  {videoUrl && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-xl mb-2 text-white">Generated Video:</h3>
                      <video src={videoUrl} controls className="w-full rounded-lg shadow-lg" />
                      <a href={videoUrl} download="manim_animation.mp4" className="block mt-2 text-blue-200 hover:underline">
                        Download Video
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="mt-8 text-gray-400 text-xs text-center">
          VIZDRE {new Date().getFullYear()}
        </footer>
      </section>
    </div>
  );
}
