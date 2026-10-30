
import io
import logging
import os
from pathlib import Path
from sarvamai import SarvamAI

import pytesseract
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from pypdf import PdfReader

from app.api.chat import DISCLAIMER, SYSTEM_PROMPT

router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Medical Report Analysis"],
)

logger = logging.getLogger(__name__)

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_EXTRACTED_CHARS = 12000

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
}


def extract_pdf_text(data: bytes) -> str:
    reader = PdfReader(io.BytesIO(data))

    if reader.is_encrypted:
        raise HTTPException(
            status_code=400,
            detail="Password-protected PDFs are not supported.",
        )

    parts = []

    for page in reader.pages[:20]:
        parts.append(page.extract_text() or "")

    return "\n".join(parts)



def extract_image_text(data: bytes) -> str:
    logger.info("Image data received: %d bytes", len(data))

    try:
        image = Image.open(io.BytesIO(data))
        logger.info(
            "Image decoded: format=%s, size=%s, mode=%s",
            image.format,
            image.size,
            image.mode,
        )
        image.load()
        return pytesseract.image_to_string(image)

    except Exception as exc:
        logger.exception(
            "Image processing failed: %s",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=400,
            detail="Image processing failed. Check the backend terminal for details.",
        ) from exc


def generate_ai_response(provider, report_text, question, language):
    instructions = (
        SYSTEM_PROMPT
        + "\n\nYou are explaining a medical report in clear, accessible language."
        + "\nOrganize every response using these four headings:"
        + "\n1. Key Findings"
        + "\n2. Test Results"
        + "\n3. Questions to Ask Your Doctor"
        + "\n4. Important Safety Information"
        + "\n\nUnder Key Findings, summarize what the supplied report says."
        + "\nUnder Test Results, list test names, values, units, and reference "
        "ranges only when they are readable in the supplied text."
        + "\nExplain whether a value is marked high or low by the report, "
        "when that information is available."
        + "\nNever invent missing values, units, or reference ranges."
        + "\nIf the report text is unclear or incomplete, state that explicitly."
        + "\nUnder Questions to Ask Your Doctor, suggest relevant questions "
        "rather than prescribing treatment."
        + "\nUnder Important Safety Information, explain that lab ranges vary "
        "and a qualified clinician must interpret results in context."
        + "\nDo not diagnose a disease or recommend starting, stopping, "
        "or changing medication."
        + "\nIf no test results can be reliably extracted, say so clearly."
    )

    if language == "hi":
        instructions += "\nRespond in Hindi."
    elif language == "ta":
        instructions += "\nRespond in Tamil."
    else:
        instructions += "\nRespond in English."

    prompt = (
        f"User's question: "
        f"{question or 'Explain this report in simple terms.'}"
        f"\n\nExtracted report text:\n{report_text[:MAX_EXTRACTED_CHARS]}"
    )

    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="OpenAI API key is not configured.",
            )

        response = OpenAI(api_key=api_key).responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            instructions=instructions,
            input=prompt,
        )

        return (response.output_text or "").strip()

    if provider == "sarvam":
        api_key = os.getenv("SARVAM_API_KEY")

        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="Sarvam API key is not configured.",
            )

        response = SarvamAI(
            api_subscription_key=api_key
        ).chat.completions(
            model="sarvam-105b",
            messages=[
                {"role": "system", "content": instructions},
                {"role": "user", "content": prompt},
            ],
            max_tokens=2000,
            reasoning_effort=None,
        )

        return (response.choices[0].message.content or "").strip()

    raise HTTPException(
        status_code=400,
        detail="Provider must be 'openai' or 'sarvam'.",
    )


@router.post("/analyze")
async def analyze_report(
    file: UploadFile = File(...),
    question: str = Form(""),
    provider: str = Form("sarvam"),
    language: str = Form("en"),
):
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Upload a PDF, PNG, JPG, JPEG, or WEBP report.",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="The uploaded file type is not supported.",
        )

    if provider not in {"openai", "sarvam"}:
        raise HTTPException(
            status_code=400,
            detail="Provider must be 'openai' or 'sarvam'.",
        )

    if language not in {"en", "hi", "ta"}:
        raise HTTPException(
            status_code=400,
            detail="Language must be en, hi, or ta.",
        )

    data = await file.read(MAX_FILE_SIZE + 1)
    logger.info("Uploaded filename=%r, content_type=%r, bytes=%d",
            filename, file.content_type, len(data))
    await file.close()

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="The file must be smaller than 10 MB.",
        )

    try:
        if extension == ".pdf":
            report_text = extract_pdf_text(data)
        else:
            report_text = extract_image_text(data)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Report text extraction failed: %s", type(exc).__name__)
        raise HTTPException(
            status_code=400,
            detail="Unable to extract text from this report.",
        ) from exc

    if not report_text.strip():
        raise HTTPException(
            status_code=422,
            detail=(
                "No readable text was found. The PDF may be scanned "
                "or the image may be unclear. Try a clearer image."
            ),
        )

    try:
        reply = generate_ai_response(
            provider=provider,
            report_text=report_text,
            question=question[:1000],
            language=language,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Report analysis failed with %s",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=502,
            detail="The AI provider could not analyze this report.",
        ) from exc

    if not reply:
        raise HTTPException(
            status_code=502,
            detail="The AI provider returned an empty response.",
        )

    return {
        "filename": filename,
        "reply": reply,
        "disclaimer": DISCLAIMER,
    }
