from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import shutil
import tempfile
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from app.pdf_utils import extract_text_from_pdf
from app.vectorstore_utils import create_faiss_index, retrieve_relevant_docs
from app.chat_utils import get_chat_model, ask_chat_model
from app.config import get_allowed_origins, get_openai_api_key
from langchain_text_splitters import RecursiveCharacterTextSplitter


class AppState:
    vectorstore = None
    chat_model = None


state = AppState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Backend starting up...")
    yield
    print("Shutting down application...")


app = FastAPI(
    title="NaviOwl 2.0 - Intelligent Document Assistant API",
    description="Backend for NaviOwl's 2.0 - Intelligent Document Assistance",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


@app.get("/")
async def root():
    """Root endpoint to check API status."""
    return {"message": "NaviOwl 2.0 API is running"}


@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload and process PDF documents."""
    try:
        all_texts = []
        for file in files:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                shutil.copyfileobj(file.file, tmp_file)
                tmp_path = tmp_file.name

            try:
                text = extract_text_from_pdf(tmp_path)
                all_texts.append(text)
            finally:
                os.unlink(tmp_path)

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

        chunks = []
        for text in all_texts:
            chunks.extend(text_splitter.split_text(text))

        if chunks:
            state.vectorstore = create_faiss_index(chunks)
            return {
                "status": "success",
                "message": f"Processed {len(files)} documents",
                "chunks": len(chunks),
            }
        else:
            return {"status": "warning", "message": "No text extracted from documents"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat endpoint for interacting with the processed documents."""
    if not state.vectorstore:
        raise HTTPException(status_code=400, detail="Please upload documents first")

    if not state.chat_model:
        try:
            api_key = get_openai_api_key()
            state.chat_model = get_chat_model(api_key)
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to initialize chat model: {str(e)}"
            )

    try:
        relevant_docs = retrieve_relevant_docs(state.vectorstore, request.message)
        context = "\n\n".join([doc.page_content for doc in relevant_docs])

        system_prompt = f"""You are NaviOwl's 2.0 Assistant, an intelligent document assistant.
Based on the provided documents, provide accurate and helpful answers.
If the information is not in the documents, clearly state that.

Documents:
{context}

User Question: {request.message}

Answer:"""

        response = ask_chat_model(state.chat_model, system_prompt)
        return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
