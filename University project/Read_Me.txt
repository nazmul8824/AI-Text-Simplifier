Project: AI Text Simplifier Browser Extension

This project has 2 parts:
1. Backend (FastAPI + Transformers model)
2. Browser extension (Chrome)

How to run:

1. Install Python packages:
   pip install fastapi uvicorn transformers torch sentencepiece

2. Open terminal in the Backend folder and run:
   python -m uvicorn app:app --port 8002

3. Open Chrome and go to:
   chrome://extensions

4. Turn on Developer mode

5. Click "Load unpacked"

6. Select the "extension" folder

7. Open any webpage, select text, click the extension, and choose:
   "Simplify Selected Text"

Important:
- Keep the backend terminal running while using the extension.
- The extension is configured to use:
  http://127.0.0.1:8002