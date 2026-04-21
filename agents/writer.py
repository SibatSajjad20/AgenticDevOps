from crewai import Agent
from tools.rag_tool import search_codebase
from config import get_llm

def writer_agent(llm_mode: str = "gemini", poetic_mode: bool = False) -> Agent:
    poetic_instruction = (
        " When writing the LinkedIn post, add 2-3 lines of Urdu or Hindi poetry "
        "that metaphorically captures the essence of the project. Make it memorable."
        if poetic_mode else ""
    )
    return Agent(
        role="Technical Content Writer",
        goal=(
            "Write a professional README.md and a LinkedIn-ready project breakdown "
            "based on the analyzed codebase." + poetic_instruction
        ),
        backstory=(
            "You turn dry code into compelling stories. You've written documentation "
            "for open-source projects used by millions. You know how to make engineers "
            "and recruiters both fall in love with a project."
        ),
        tools=[search_codebase],
        llm=get_llm(llm_mode),
        verbose=True
    )
