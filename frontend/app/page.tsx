"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [code, setCode] = useState(`def greet(name):
    return f"Hello, {name}"

print(greet("World"))
`);

  const [response, setResponse] = useState("AI response will appear here...");
  const [mode, setMode] = useState("explain");

  const handleAskAI = async () => {
    try {
      const res = await fetch("https://codemindai-0eu9.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "Please help with this code",
            },
          ],
          mode,
          code,
          language: "python",
        }),
      });

      const data = await res.json();
      console.log(data);

      setResponse(
        data.reply || data.error || "No response received."
      );
    } catch (error) {
      setResponse("Failed to connect to backend.");
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <div className="border-b border-gray-800 px-6 py-4 text-xl font-bold">
        CodeMind AI
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-2 h-[calc(100vh-70px)]">
        
        {/* Left: Code Editor */}
        <div className="border-r border-gray-800">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
          />
        </div>

        {/* Right: Chat Panel */}
        <div className="p-6 flex flex-col gap-4">
          
          {/* Mode Buttons */}
          <div className="flex gap-3">
            {["explain", "debug", "ask"].map((item) => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={`px-4 py-2 rounded-lg border ${
                  mode === item
                    ? "bg-white text-black"
                    : "border-gray-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Ask AI Button */}
          <button
            onClick={handleAskAI}
            className="bg-blue-600 px-4 py-3 rounded-lg font-semibold"
          >
            Ask AI
          </button>

          {/* Response Box */}
          <div className="flex-1 overflow-auto rounded-xl border border-gray-700 p-4 bg-zinc-900">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        </div>
      </div>
    </main>
  );
}