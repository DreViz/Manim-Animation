// src/components/PromptForm.jsx
import { useState } from "react";

export default function PromptForm() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");

  const handleGenerateCode = async () => {
    try {
      const res = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setOutput(data.result || "No output");
    } catch (err) {
      setOutput("Error: " + err.message);
    }
  };

  const handleGenerateVideo = () => {
    alert("Video rendering not implemented yet.");
    // You’ll hook this up later to call your Python script for rendering
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold mb-4 text-center">Manim Prompt UI</h1>
      <textarea
        className="w-full h-24 p-3 border rounded-lg resize-none"
        placeholder="Enter your animation prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="mt-4 flex gap-4 justify-center">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
          onClick={handleGenerateCode}
        >
          Generate Code
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
          onClick={handleGenerateVideo}
        >
          Generate Video
        </button>
      </div>
      {output && (
        <pre className="mt-6 bg-gray-100 p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">
          {output}
        </pre>
      )}
    </div>
  );
}
