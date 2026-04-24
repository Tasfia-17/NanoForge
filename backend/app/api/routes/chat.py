from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()


class ChatRequest(BaseModel):
    user_id: str
    chat_session_id: str
    user_message: str
    agent_id: Optional[int] = None
    attachment_ids: list[str] = []


class PlanOption(BaseModel):
    plan_id: str
    title: str
    summary: str
    estimated_actions: int
    price_usdc: float
    price_display: str


class ChatResponse(BaseModel):
    chat_plan_id: str
    user_message: str
    recommended_plans: list[PlanOption]
    quote_usdc: float
    quote_display: str
    gemini_reasoning: Optional[str] = None


@router.post("/plans", response_model=ChatResponse)
def create_chat_plan(payload: ChatRequest):
    """
    Use Gemini to reason about the user goal and return USDC-priced execution plans.
    Gemini analyzes complexity, estimates actions, and recommends the best plan.
    Each action costs $0.001 USDC on Arc via Circle Nanopayments.
    """
    from app.core.config import get_settings
    settings = get_settings()

    gemini_reasoning = None
    plans = _default_plans(payload.user_message)

    if settings.gemini_api_key:
        try:
            from google import genai as google_genai
            client_g = google_genai.Client(api_key=settings.gemini_api_key)
            prompt = (
                f"You are a task planner for an AI agent marketplace where every action costs $0.001 USDC on Arc.\n"
                f"User goal: {payload.user_message}\n\n"
                f"Analyze this goal and respond in this exact format:\n"
                f"FAST_ACTIONS: <number 3-8>\n"
                f"FAST_SUMMARY: <one sentence, what the fast plan does>\n"
                f"THOROUGH_ACTIONS: <number 10-20>\n"
                f"THOROUGH_SUMMARY: <one sentence, what the thorough plan does>\n"
                f"REASONING: <one sentence explaining the complexity>"
            )
            response = client_g.models.generate_content(model=settings.gemini_model, contents=prompt)
            text = response.text
            gemini_reasoning = _extract_field(text, "REASONING")
            plans = _parse_gemini_plans(text) or plans
        except Exception:
            pass

    return ChatResponse(
        chat_plan_id=str(uuid.uuid4()),
        user_message=payload.user_message,
        recommended_plans=plans,
        quote_usdc=plans[0].price_usdc,
        quote_display=plans[0].price_display,
        gemini_reasoning=gemini_reasoning,
    )


def _default_plans(message: str) -> list[PlanOption]:
    return [
        PlanOption(plan_id="fast", title="Fast Execution",
                   summary="Single-agent, direct execution. Best for simple tasks.",
                   estimated_actions=5, price_usdc=0.005, price_display="$0.005 USDC"),
        PlanOption(plan_id="thorough", title="Thorough Execution",
                   summary="Multi-step with verification. Best for complex tasks.",
                   estimated_actions=12, price_usdc=0.012, price_display="$0.012 USDC"),
    ]


def _extract_field(text: str, field: str) -> Optional[str]:
    for line in text.splitlines():
        if line.startswith(f"{field}:"):
            return line.split(":", 1)[1].strip()
    return None


def _parse_gemini_plans(text: str) -> Optional[list[PlanOption]]:
    try:
        fast_actions = int(_extract_field(text, "FAST_ACTIONS") or "5")
        fast_summary = _extract_field(text, "FAST_SUMMARY") or "Direct execution."
        thorough_actions = int(_extract_field(text, "THOROUGH_ACTIONS") or "12")
        thorough_summary = _extract_field(text, "THOROUGH_SUMMARY") or "Multi-step execution."
        fast_price = round(fast_actions * 0.001, 4)
        thorough_price = round(thorough_actions * 0.001, 4)
        return [
            PlanOption(plan_id="fast", title="Fast Execution", summary=fast_summary,
                       estimated_actions=fast_actions, price_usdc=fast_price,
                       price_display=f"${fast_price:.4f} USDC"),
            PlanOption(plan_id="thorough", title="Thorough Execution", summary=thorough_summary,
                       estimated_actions=thorough_actions, price_usdc=thorough_price,
                       price_display=f"${thorough_price:.4f} USDC"),
        ]
    except Exception:
        return None
