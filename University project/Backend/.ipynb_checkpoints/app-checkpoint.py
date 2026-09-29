from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

app = FastAPI(title="Text Simplification API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "google/flan-t5-base"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

class SimplifyRequest(BaseModel):
    text: str
    mode: str

class SimplifyResponse(BaseModel):
    simplified_text: str

def build_prompt(mode: str, text: str) -> str:
    mode = mode.strip().lower()

    if mode == "fifth_grader":
        instruction = (
            "Rewrite the following text so that a 5th-grade student can understand it. "
            "Keep the meaning correct, use simple words, and make it clear."
        )
    elif mode == "basic":
        instruction = (
            "Simplify the following text to a basic level. "
            "Use easier vocabulary and shorter sentences, but keep the main idea."
        )
    elif mode == "no_jargon":
        instruction = (
            "Rewrite the following text in plain language. "
            "Keep the core meaning, but remove difficult terminology and jargon."
        )
    else:
        instruction = "Simplify the following text while preserving the meaning."

    return f"{instruction}\n\nText:\n{text}"

@app.get("/")
def root():
    return {"message": "Text Simplification API is running"}

@app.post("/simplify", response_model=SimplifyResponse)
def simplify_text(data: SimplifyRequest):
    text = data.text.strip()

    if not text:
        return {"simplified_text": ""}

    prompt = build_prompt(data.mode, text)

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=512
    )

    output_ids = model.generate(
        **inputs,
        max_new_tokens=256,
        do_sample=False
    )

    simplified = tokenizer.decode(output_ids[0], skip_special_tokens=True).strip()

    return {"simplified_text": simplified}