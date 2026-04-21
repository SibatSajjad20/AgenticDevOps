import os
from dotenv import load_dotenv
load_dotenv()

import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Available embedding models:")
for m in genai.list_models():
    if "embed" in m.name.lower():
        print(f"  {m.name} — {m.supported_generation_methods}")
