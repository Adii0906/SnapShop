from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.routers.businesses import get_business_by_slug
from app.routers.products import _to_out
from app.schemas import AssistantAction, AssistantChatRequest, AssistantChatResponse
from app.services.assistant_service import execute_action, parse_intent

router = APIRouter(prefix="/api/businesses/{slug}/assistant", tags=["assistant"])

EXAMPLES = (
    'Try things like "change the blue shirt price to 699", '
    '"give all shirts 20% discount", "set stock of sports shoes to 5", '
    'or "hide wallet".'
)


@router.post("/chat", response_model=AssistantChatResponse)
async def chat(slug: str, payload: AssistantChatRequest, db: Session = Depends(get_db)):
    business = get_business_by_slug(slug, db)

    if payload.confirm:
        touched = execute_action(db, business, payload.confirm.tool, payload.confirm.params)
        return AssistantChatResponse(
            reply=f"Done. {payload.confirm.summary}.",
            products=[_to_out(p) for p in touched],
        )

    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="message is required")

    action = parse_intent(business, payload.message)
    if action is None:
        return AssistantChatResponse(
            reply=f"I didn't catch a product action in that. {EXAMPLES}"
        )

    if action.needs_confirmation:
        return AssistantChatResponse(
            reply=f"{action.summary} - confirm?",
            pending=AssistantAction(tool=action.tool, params=action.params, summary=action.summary),
            products=[_to_out(p) for p in action.matched_products],
        )

    touched = execute_action(db, business, action.tool, action.params)
    return AssistantChatResponse(
        reply=action.summary,
        products=[_to_out(p) for p in touched or action.matched_products],
    )
