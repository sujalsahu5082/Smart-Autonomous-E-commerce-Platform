import json
import logging
from typing import Any

from ai.llm import get_llm

logger = logging.getLogger(__name__)

MAX_DATA_CHARS = 8000


def _json(data: Any) -> str:
    return json.dumps(data, indent=2, default=str)[:MAX_DATA_CHARS]


def build_discovery_crew(
    query: str,
    products: list[dict],
    user_context: dict | None = None,
    reviews: list[dict] | None = None,
) -> Any:
    """Build the CrewAI crew for conversational product discovery.

    Coordinator Agent manages the workflow; specialized agents (search,
    recommendations, pricing, coupons, reviews) each handle their own task.
    All data is passed in as task context (plain JSON), keeping the agents
    decoupled from the e-commerce CRUD layer.
    """
    from crewai import Agent, Crew, Process, Task

    llm = get_llm()
    catalog = _json(products)
    customer = _json(user_context or {"orders": [], "wishlist": []})
    review_data = _json(reviews or [])

    search_agent = Agent(
        role="Product Search Specialist",
        goal="Identify the products that best match the customer's query from the retrieved catalog",
        backstory=(
            "You are an expert e-commerce search analyst. You select relevant products "
            "from the RAG-retrieved catalog and explain why each matches."
        ),
        llm=llm,
        allow_delegation=False,
        max_iter=5,
    )
    recommendation_agent = Agent(
        role="Recommendation Specialist",
        goal="Recommend products based on the customer's order and wishlist history",
        backstory=(
            "You are a personal shopping assistant. You cross-reference the catalog "
            "with the customer's purchase history and wishlist to make personalised suggestions."
        ),
        llm=llm,
        allow_delegation=False,
        max_iter=5,
    )
    pricing_agent = Agent(
        role="Pricing Analyst",
        goal="Analyse prices, discounts and value for money across the retrieved products",
        backstory=(
            "You are a pricing analyst. You compare prices and discount percentages "
            "and highlight the best deals and price-after-discount figures."
        ),
        llm=llm,
        allow_delegation=False,
        max_iter=5,
    )
    coupon_agent = Agent(
        role="Coupon Specialist",
        goal="Suggest applicable coupon offers or promotional deals for the customer's basket",
        backstory=(
            "You are a promotions expert. You suggest relevant demo coupon codes such as "
            "SAVE10 (10% off), FLAT50 (flat 50 off above 1500) or WELCOME15 for new customers, "
            "and state any assumptions clearly."
        ),
        llm=llm,
        allow_delegation=False,
        max_iter=5,
    )
    review_agent = Agent(
        role="Review Analyst",
        goal="Summarise customer sentiment and key pros/cons from product reviews",
        backstory=(
            "You are a review analyst. You condense ratings and comments into a short, "
            "balanced summary. If no reviews exist, say so instead of inventing them."
        ),
        llm=llm,
        allow_delegation=False,
        max_iter=5,
    )
    coordinator = Agent(
        role="Coordinator Agent",
        goal=(
            "Manage the discovery workflow and synthesise the outputs of all specialist "
            "agents into one final customer-facing answer"
        ),
        backstory=(
            "You coordinate the workflow of the Smart Autonomous E-commerce Platform. "
            "You merge the specialist outputs into a friendly, concise, structured answer "
            "that directly addresses the customer's message."
        ),
        llm=llm,
        allow_delegation=False,
        max_iter=5,
    )

    search_task = Task(
        description=(
            f"The customer asked: \"{query}\"\n\n"
            f"RAG-retrieved catalog:\n{catalog}\n\n"
            "Pick the 2-5 most relevant products. For each, give the name and a one-line reason."
        ),
        expected_output="A concise list of 2-5 selected product names with one-line reasons.",
        agent=search_agent,
    )
    recommendation_task = Task(
        description=(
            f"The customer asked: \"{query}\"\n\n"
            f"Catalog:\n{catalog}\n\nCustomer context:\n{customer}\n\n"
            "Suggest 2-3 additional products the customer is likely to like, or explain "
            "that no strong signals exist."
        ),
        expected_output="2-3 personalised product suggestions or a short explanation.",
        agent=recommendation_agent,
    )
    pricing_task = Task(
        description=(
            f"Analyse value for money in this catalog:\n{catalog}\n\n"
            "Highlight the best deals using price, price_after_discount and discount."
        ),
        expected_output="A short pricing/value-for-money analysis with concrete figures.",
        agent=pricing_agent,
    )
    coupon_task = Task(
        description=(
            f"Suggest demo coupon codes applicable to this catalog:\n{catalog}\n\n"
            "List each code with its assumed condition."
        ),
        expected_output="A short list of demo coupon codes with conditions.",
        agent=coupon_agent,
    )
    review_task = Task(
        description=(
            f"Summarise sentiment for the relevant products.\n\nReviews:\n{review_data}\n\n"
            "Keep it to 2-4 sentences. Do not invent reviews."
        ),
        expected_output="A short sentiment summary or a note that no reviews exist.",
        agent=review_agent,
    )
    final_task = Task(
        description=(
            f"The customer asked: \"{query}\"\n\n"
            "Synthesise the specialist outputs into one final answer. Structure it as: "
            "1) direct answer, 2) best-matching products, 3) best deals, 4) coupons, 5) reviews "
            "(only if present). Be friendly and concise. Do not invent products that are not in the catalog."
        ),
        expected_output="A final structured, customer-facing answer.",
        agent=coordinator,
        context=[search_task, recommendation_task, pricing_task, coupon_task, review_task],
    )

    return Crew(
        agents=[search_agent, recommendation_agent, pricing_agent, coupon_agent, review_agent, coordinator],
        tasks=[search_task, recommendation_task, pricing_task, coupon_task, review_task, final_task],
        process=Process.sequential,
        verbose=False,
    )
