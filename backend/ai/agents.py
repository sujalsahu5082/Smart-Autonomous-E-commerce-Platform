import json
import logging
from typing import Any

from ai.llm import get_llm

logger = logging.getLogger(__name__)

MAX_DATA_CHARS = 8000


def _json(data: Any) -> str:
    return json.dumps(data, indent=2, default=str)[:MAX_DATA_CHARS]


def _tools():
    """CrewAI Tool objects wrapping the retrieval/search service functions."""
    from crewai.tools import tool

    from ai import tools as service

    return {
        "query_chromadb_products": tool(service.query_chromadb_products),
        "get_reviews_context": tool(service.get_reviews_context),
        "query_products_by_category": tool(service.query_products_by_category),
        "filter_by_budget": tool(service.filter_by_budget),
        "get_applicable_coupons": tool(service.get_applicable_coupons),
    }


def build_discovery_crew(
    query: str,
    products: list[dict],
    user_context: dict | None = None,
    reviews: list[dict] | None = None,
    coupons: list[dict] | None = None,
) -> Any:
    """Build the CrewAI crew for conversational product discovery.

    Hierarchical workflow: the Coordinator Agent acts as the manager and
    delegates to the specialist agents (search, recommendations, pricing,
    coupons, reviews), each equipped only with the tools it needs. Retrieved
    data is also injected as task context to keep the crew reliable.
    """
    from crewai import Agent, Crew, Process, Task

    tools = _tools()
    llm = get_llm()
    catalog = _json(products)
    customer = _json(user_context or {"orders": [], "wishlist": []})
    review_data = _json(reviews or [])
    coupon_data = _json(coupons or [])

    search_agent = Agent(
        role="Product Search Specialist",
        goal="Find the products that best match the customer's query using semantic search",
        backstory=(
            "You are an expert e-commerce search analyst. You use the ChromaDB "
            "search tool to find matching products and explain why each one fits."
        ),
        tools=[tools["query_chromadb_products"]],
        llm=llm,
        allow_delegation=False,
        max_iter=5,
    )
    recommendation_agent = Agent(
        role="Recommendation Specialist",
        goal="Recommend related or complementary products based on the customer's history, category and tags",
        backstory=(
            "You are a personal shopping assistant. You query the product database "
            "by category and tags to surface products the customer is likely to love."
        ),
        tools=[tools["query_products_by_category"]],
        llm=llm,
        allow_delegation=False,
        max_iter=5,
    )
    pricing_agent = Agent(
        role="Pricing Analyst",
        goal="Analyse prices, discounts and budget constraints across the catalog",
        backstory=(
            "You are a pricing analyst. You filter products by budget with the "
            "budget tool and highlight the best price-after-discount deals."
        ),
        tools=[tools["filter_by_budget"]],
        llm=llm,
        allow_delegation=False,
        max_iter=5,
    )
    coupon_agent = Agent(
        role="Coupon Specialist",
        goal="Suggest applicable coupons from the Coupon table for the customer's basket",
        backstory=(
            "You are a promotions expert. You check the Coupon table with the "
            "coupon lookup tool and only recommend codes that actually exist."
        ),
        tools=[tools["get_applicable_coupons"]],
        llm=llm,
        allow_delegation=False,
        max_iter=5,
    )
    review_agent = Agent(
        role="Review Analyst",
        goal="Summarise customer sentiment and key pros/cons from product reviews",
        backstory=(
            "You are a review analyst. You pull review context with the reviews "
            "tool and condense ratings and comments into a short, balanced summary."
        ),
        tools=[tools["get_reviews_context"]],
        llm=llm,
        allow_delegation=False,
        max_iter=5,
    )
    coordinator = Agent(
        role="Coordinator Agent",
        goal=(
            "Manage the discovery workflow: parse the customer's intent, delegate "
            "to the right specialist agents, and synthesise their outputs into one "
            "final customer-facing answer"
        ),
        backstory=(
            "You are the manager of the Smart Autonomous E-commerce Platform. "
            "You decide which specialists to engage for each request and merge "
            "their results into a friendly, concise, structured answer."
        ),
        llm=llm,
        allow_delegation=True,
        max_iter=5,
    )

    search_task = Task(
        description=(
            f"The customer asked: \"{query}\"\n\n"
            f"RAG-retrieved catalog:\n{catalog}\n\n"
            "Use the ChromaDB search tool if you need more products. "
            "Pick the 2-5 most relevant products and give the name plus a one-line reason for each."
        ),
        expected_output="A concise list of 2-5 selected product names with one-line reasons.",
        agent=search_agent,
    )
    recommendation_task = Task(
        description=(
            f"The customer asked: \"{query}\"\n\n"
            f"Catalog:\n{catalog}\n\nCustomer context:\n{customer}\n\n"
            "Use the category/tags query tool to find related or complementary products. "
            "Suggest 2-3 of them, or explain that no strong signals exist."
        ),
        expected_output="2-3 personalised product suggestions or a short explanation.",
        agent=recommendation_agent,
    )
    pricing_task = Task(
        description=(
            f"Analyse value for money in this catalog:\n{catalog}\n\n"
            "If the customer mentioned a budget, use the budget filter tool. "
            "Highlight the best deals using price, price_after_discount and discount."
        ),
        expected_output="A short pricing/value-for-money analysis with concrete figures.",
        agent=pricing_agent,
    )
    coupon_task = Task(
        description=(
            f"Active coupons in the system:\n{coupon_data}\n\n"
            f"Catalog:\n{catalog}\n\n"
            "Use the coupon lookup tool to check the Coupon table for applicable codes. "
            "List each code with its discount and what it applies to. If none apply, "
            "say so. Do not invent coupon codes."
        ),
        expected_output="A short list of real applicable coupon codes with their conditions.",
        agent=coupon_agent,
    )
    review_task = Task(
        description=(
            f"Summarise sentiment for the relevant products.\n\nReviews:\n{review_data}\n\n"
            "Use the reviews tool to pull per-product review context when useful. "
            "Keep it to 2-4 sentences. Do not invent reviews."
        ),
        expected_output="A short sentiment summary or a note that no reviews exist.",
        agent=review_agent,
    )
    final_task = Task(
        description=(
            f"The customer asked: \"{query}\"\n\n"
            "Synthesise the specialists' outputs into one final answer. Structure it as: "
            "1) direct answer, 2) best-matching products, 3) best deals, 4) coupons, 5) reviews "
            "(only if present). Be friendly and concise. Do not invent products that are not in the catalog."
        ),
        expected_output="A final structured, customer-facing answer.",
        agent=coordinator,
    )

    return Crew(
        agents=[search_agent, recommendation_agent, pricing_agent, coupon_agent, review_agent],
        tasks=[search_task, recommendation_task, pricing_task, coupon_task, review_task, final_task],
        process=Process.hierarchical,
        manager_agent=coordinator,
        verbose=False,
    )
