from pypdf import PdfReader
from typing import Union, BinaryIO
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file: Union[str, BinaryIO]) -> str:
    """
    Extracts text from a PDF file.

    Args:
        file: A file path (str) or a file-like object (BinaryIO).

    Returns:
        Extracted text as a string.
    """
    try:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + " "
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return ""
