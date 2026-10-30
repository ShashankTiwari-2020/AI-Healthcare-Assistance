
import os
import logging
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field
from sarvamai import SarvamAI

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/chat",
    tags=["AI Health Assistant"],
)

DISCLAIMER = (
    "This service provides general health information only. "
    "It does not diagnose conditions or replace advice from "
    "a qualified healthcare professional. For emergencies, "
    "seek immediate medical attention."
)

SYSTEM_PROMPT = """
You are MediConnect AI, a healthcare information assistant.
Provide clear, cautious, general health information.
Do not claim to diagnose a medical condition or replace a doctor.
Never recommend starting, stopping, or changing prescription
medication without consulting a qualified healthcare professional.
If symptoms suggest a medical emergency, advise the user to seek
immediate emergency medical care.
If you are uncertain, say so. Do not invent medical facts.
"""

class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="A general healthcare information question",
    )
    provider: str = Field(
        default="sarvam",
        description="AI provider: sarvam or openai",
    )


class ChatResponse(BaseModel):
    reply: str
    disclaimer: str


@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=422,
            detail="Please enter a message.",
        )

    provider = request.provider.strip().lower()

    if provider not in {"sarvam", "openai"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid provider. Choose 'sarvam' or 'openai'.",
        )

    try:
        if provider == "sarvam":
            api_key = os.getenv("SARVAM_API_KEY")
            if not api_key:
                raise HTTPException(
                    status_code=503,
                    detail="Sarvam API key is not configured.",
                )

            client = SarvamAI(api_subscription_key=api_key)
            response = client.chat.completions(
                model="sarvam-105b",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": message},
                ],
                max_tokens=2000,
                reasoning_effort=None,
            )
            reply = response.choices[0].message.content

        else:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise HTTPException(
                    status_code=503,
                    detail="OpenAI API key is not configured.",
                )

            client = OpenAI(api_key=api_key)
            response = client.responses.create(
                model=os.getenv("OPENAI_MODEL", "gpt-6-astra"),
                instructions=SYSTEM_PROMPT,
                input=message,
            )
            reply = response.output_text

        if not reply or not reply.strip():
            raise HTTPException(
                status_code=502,
                detail="The selected AI provider returned an empty response.",
            )

        return ChatResponse(
            reply=reply.strip(),
            disclaimer=DISCLAIMER,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
        "%s AI request failed: %s",
        provider.title(),
        type(exc).__name__,
    )
    raise HTTPException(
        status_code=502,
        detail=(
            f"The {provider.title()} AI request failed. "
            "Check the backend terminal for the error details."
        ),
    )
