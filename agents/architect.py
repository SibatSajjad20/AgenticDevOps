from crewai import Agent
from tools.github_tool import scrape_github_repo
from tools.rag_tool import search_codebase
from config import get_llm

def architect_agent(llm_mode: str = "gemini") -> Agent:
    return Agent(
        role="Senior Software Architect",
        goal=(
            "Analyze the GitHub repository and identify the tech stack, "
            "design patterns, architectural decisions, and potential bugs."
        ),
        backstory=(
            "You have 10 years of experience reading codebases across every language. "
            "Nothing escapes your eye — from a missing null check to a flawed architecture."
        ),
        tools=[scrape_github_repo, search_codebase],
        llm=get_llm(llm_mode),
        verbose=True
    )
