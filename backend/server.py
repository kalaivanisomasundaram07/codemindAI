import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY not found in .env file")

client = Groq(api_key=api_key)

SYSTEM_PROMPTS = {
    "explain": """
You are an expert code educator.
Explain the code clearly step by step.
""",

    "debug": """
You are an expert software debugger.
Find bugs and provide corrected code.
""",

    "ask": """
You are a senior software engineer.
Answer coding questions clearly with examples.
"""
}


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model": "llama3-8b-8192"
    })


@app.route("/chat", methods=["POST"])
def chat():
    print("Chat endpoint reached")

    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    messages = data.get("messages", [])
    mode = data.get("mode", "ask")
    code = data.get("code", "")
    language = data.get("language", "python")

    if not messages:
        return jsonify({"error": "messages required"}), 400

    last_message = messages[-1]["content"]

    full_prompt = f"""
{SYSTEM_PROMPTS.get(mode, "")}

User Question:
{last_message}

Code ({language}):

{code}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": full_prompt
                }
            ],
            temperature=0.3
)

        reply = response.choices[0].message.content

        return jsonify({
            "reply": reply,
            "mode": mode
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    print("CodeMind Backend Running → http://localhost:5000")
    app.run(debug=True, port=5000)