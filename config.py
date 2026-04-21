import os
from dotenv import load_dotenv
from crewai import LLM

load_dotenv()

def get_llm(mode: str = "gemini"):
    if mode == "ollama":
        return LLM(model="ollama/llama3", base_url="http://localhost:11434")
    return LLM(
        model="gemini/gemini-2.5-flash-lite",
        api_key=os.getenv("GEMINI_API_KEY")
    )
