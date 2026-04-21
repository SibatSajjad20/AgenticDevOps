from crewai import Crew, Task, Process
from agents.architect import architect_agent
from agents.writer import writer_agent
from agents.interviewer import interviewer_agent

def build_crew(repo_url: str, llm_mode: str = "gemini", poetic_mode: bool = False) -> Crew:
    architect = architect_agent(llm_mode)
    writer = writer_agent(llm_mode, poetic_mode)
    interviewer = interviewer_agent(llm_mode)

    analyze_task = Task(
        description=(
            f"Scrape the GitHub repo at {repo_url}. Identify the tech stack, "
            "frameworks, design patterns, and any potential bugs or code smells. "
            "Return a structured analysis."
        ),
        expected_output=(
            "A structured report with: tech_stack (list), design_patterns (list), "
            "potential_bugs (list), and a summary paragraph."
        ),
        agent=architect
    )

    write_task = Task(
        description=(
            f"Using the architect's analysis of {repo_url}, write: "
            "1) A professional README.md for the project. "
            "2) A LinkedIn post announcing the project."
        ),
        expected_output=(
            "Two sections clearly labeled: '## README' and '## LinkedIn Post'."
        ),
        agent=writer,
        context=[analyze_task]
    )

    interview_task = Task(
        description=(
            f"Using the architect's analysis of {repo_url}, generate exactly 10 "
            "hard interview questions that are specific to this codebase. "
            "Each question must reference actual code logic or decisions in the repo."
        ),
        expected_output=(
            "A numbered list of 10 interview questions, each with a brief explanation "
            "of what concept it tests."
        ),
        agent=interviewer,
        context=[analyze_task]
    )

    return Crew(
        agents=[architect, writer, interviewer],
        tasks=[analyze_task, write_task, interview_task],
        process=Process.sequential,
        verbose=True
    )
