import "./index.css";
import React, { useState } from "react";

const THEMES = {
  indigo: {
    pageBg: "bg-slate-900",
    headerBg: "bg-indigo-600",
    codeBtn: "bg-indigo-600 hover:bg-indigo-700",
    videoBtn: "bg-slate-700 hover:bg-slate-800",
    ring: "focus:ring-indigo-500",
    inputBg: "bg-slate-800 border-slate-700 text-gray-100 placeholder-gray-400",
  },
  // Vibrant
  purple: {
    pageBg: "bg-zinc-900",
    headerBg: "bg-purple-600",
    codeBtn: "bg-purple-600 hover:bg-purple-700",
    videoBtn: "bg-fuchsia-600 hover:bg-fuchsia-700",
    ring: "focus:ring-purple-500",
    inputBg: "bg-slate-800 border-slate-700 text-gray-100 placeholder-gray-400",
  },
  // Fresh
  emerald: {
    pageBg: "bg-neutral-900",
    headerBg: "bg-emerald-600",
    codeBtn: "bg-emerald-600 hover:bg-emerald-700",
    videoBtn: "bg-teal-600 hover:bg-teal-700",
    ring: "focus:ring-emerald-500",
    inputBg: "bg-slate-800 border-slate-700 text-gray-100 placeholder-gray-400",
  },
  // Trusty
  blue: {
    pageBg: "bg-slate-900",
    headerBg: "bg-blue-600",
    codeBtn: "bg-blue-600 hover:bg-blue-700",
    videoBtn: "bg-sky-600 hover:bg-sky-700",
    ring: "focus:ring-sky-500",
    inputBg: "bg-slate-800 border-slate-700 text-gray-100 placeholder-gray-400",
  },
};

function ThemeSwitcher({ themeKey, setThemeKey }) {
  return (
    <div className="flex gap-2 justify-center mb-4">
      {Object.keys(THEMES).map((k) => (
        <button
          key={k}
          onClick={() => setThemeKey(k)}
          className={`px-3 py-1 rounded text-xs font-medium border border-white/20 ${
            themeKey === k ? "bg-white/15 text-white" : "bg-white/5 text-white/80 hover:bg-white/10"
          }`}
          title={`Switch to ${k} theme`}
        >
          {k}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [themeKey, setThemeKey] = useState("indigo");
  const t = THEMES[themeKey];

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
      const endpoint = type === "video" ? "/generate?type=video" : "/generate";
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
          setError((await blob.text()) || "Server error");
        }
      } else {
        if (!res.ok) throw new Error("Server error");
        const data = await res.json().catch(() => null);
        setCode(data?.result || (await res.text()));
      }
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${t.pageBg} min-h-screen`}>
      <section className="mt-12 lg:mt-24">
        {/* Header band (swap to gradient by uncommenting below) */}
        <div
          className={`${t.headerBg} text-white -skew-y-1`}
          // className={`bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white -skew-y-1`}
        >
          <div className="container mx-auto skew-y-1">
            <div className="flex flex-col items-center py-10 text-center lg:py-20">
              {/* Theme Switcher */}
              <ThemeSwitcher themeKey={themeKey} setThemeKey={setThemeKey} />

              <div className="w-full px-4 lg:w-1/2 lg:px-0">
                <div className="mb-8">
                  <h2 className="text-3xl lg:text-4xl font-light mb-3">
                    Manim Animation Generator
                  </h2>
                  <p className="text-lg lg:text-xl opacity-90">
                    Describe your animation and let AI generate the code or video!
                  </p>
                </div>

                {/* Search bar */}
                <div className="w-full mb-6">
                  <form action="#" method="GET" onSubmit={(e) => e.preventDefault()}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-300"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                          ></path>
                        </svg>
                      </div>
                      <input
                        type="search"
                        name="search"
                        placeholder="Describe your animation..."
                        className={`p-4 pl-10 rounded-lg w-full border ${t.inputBg} focus:outline-none focus:ring-4 ${t.ring}`}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>
                  </form>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mb-8 justify-center">
                  <button
                    className={`${t.codeBtn} text-white px-6 py-3 rounded-lg font-semibold transition-colors hover:ring-2 hover:ring-white/20 disabled:bg-gray-400`}
                    onClick={() => handleGenerate("code")}
                    disabled={loading || !prompt.trim()}
                  >
                    {loading ? "Generating..." : "Generate Code"}
                  </button>
                  <button
                    className={`${t.videoBtn} text-white px-6 py-3 rounded-lg font-semibold transition-colors hover:ring-2 hover:ring-white/20 disabled:bg-gray-400`}
                    onClick={() => handleGenerate("video")}
                    disabled={loading || !prompt.trim()}
                  >
                    {loading ? "Generating..." : "Generate Video"}
                  </button>
                </div>

                {/* Output */}
                <div className="w-full text-left">
                  {error && (
                    <div className="bg-red-200 text-red-800 p-3 rounded mb-4">{error}</div>
                  )}
                  {loading && (
                    <div className="text-gray-100 mb-4 text-center">Processing...</div>
                  )}
                  {code && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-xl mb-2 text-white">
                        Generated Code:
                      </h3>
                      <pre className="bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{code}</code>
                      </pre>
                    </div>
                  )}
                  {videoUrl && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-xl mb-2 text-white">Generated Video:</h3>
                      <video src={videoUrl} controls className="w-full rounded-lg shadow-lg" />
                      <a
                        href={videoUrl}
                        download="manim_animation.mp4"
                        className="block mt-2 text-blue-200 hover:underline"
                      >
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
