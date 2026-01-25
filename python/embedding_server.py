from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import os

app = Flask(__name__)
model = SentenceTransformer("all-MiniLM-L6-v2")

@app.route("/embed", methods=["POST"])
def embed():
    data = request.get_json()
    text = data.get("text", "").lower().strip()

    embedding = model.encode(
        [text],
        normalize_embeddings=True
    )

    return jsonify({
        "embeddings": embedding.tolist()
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050)
