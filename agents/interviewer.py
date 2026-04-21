from crewai import Agent
from tools.rag_tool import search_codebase
from config import get_llm

def interviewer_agent(llm_mode: str = "gemini") -> Agent:
    return Agent(
        role="Senior Technical Interviewer",
        goal=(
            "Generate exactly 10 hard, specific interview questions based on THIS "
            "codebase — not generic questions. Each question must reference actual "
            "logic, patterns, or decisions found in the repo."
        ),
        backstory=(
            "You've interviewed 500+ engineers at top tech companies. You never ask "
            "generic questions. You read the candidate's actual code and ask them to "
            "defend every decision they made."
        ),
        tools=[search_codebase],
        llm=get_llm(llm_mode),
        verbose=True
    )
