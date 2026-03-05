# Low Level Design (LLD)
## NaviOwl: Intelligent Document Assistant

---

**Document Information**

| Field | Details |
|-------|---------|
| **Product Name** | NaviOwl |
| **Version** | 2.0 |
| **Document Date** | February 7, 2026 |
| **Document Type** | Low Level Design |
| **Status** | Active Development |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Module Specifications](#2-module-specifications)
3. [Class Diagrams](#3-class-diagrams)
4. [Detailed Component Design](#4-detailed-component-design)
5. [Algorithms & Logic](#5-algorithms--logic)
6. [Data Structures](#6-data-structures)
7. [Error Handling](#7-error-handling)
8. [Testing Strategy](#8-testing-strategy)
9. [Code Standards](#9-code-standards)
10. [Appendix](#10-appendix)

---

## 1. Introduction

### 1.1 Purpose

This Low Level Design (LLD) document provides detailed technical specifications for implementing the NaviOwl system. It includes class structures, method signatures, algorithms, data structures, and implementation guidelines.

### 1.2 Scope

This document covers:
- Detailed module and class specifications
- Method signatures with parameters and return types
- Algorithm implementations and pseudocode
- Data structure definitions
- Error handling strategies
- Unit testing approaches

### 1.3 Audience

- Software Developers
- QA Engineers
- Technical Leads
- Code Reviewers

---

## 2. Module Specifications

### 2.1 Backend Modules

#### 2.1.1 Main Application Module
**File**: `backend/main.py`

**Purpose**: FastAPI application entry point with endpoint definitions

**Dependencies**:
```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import shutil, tempfile, os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.pdf_utils import extract_text_from_pdf
from app.vectorstore_utils import create_faiss_index, retrieve_relevant_docs
from app.chat_utils import get_chat_model, ask_chat_model
from app.config import get_allowed_origins, get_openai_api_key
```

**Classes**:
- `AppState`: Application state container
- `ChatRequest`: Pydantic model for chat requests

**Functions**:
- `lifespan()`: Application lifecycle manager
- `root()`: Health check endpoint
- `upload_files()`: Document upload handler
- `chat()`: Chat query handler

---

#### 2.1.2 PDF Utilities Module
**File**: `backend/app/pdf_utils.py`

**Purpose**: PDF text extraction utilities

**Dependencies**:
```python
from pypdf import PdfReader
from typing import Union, BinaryIO
import logging
```

**Functions**:
- `extract_text_from_pdf()`: Extract text from PDF files

---

#### 2.1.3 Vector Store Utilities Module
**File**: `backend/app/vectorstore_utils.py`

**Purpose**: FAISS vector store operations

**Dependencies**:
```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from typing import List
import logging
from app.config import get_openai_api_key
```

**Functions**:
- `get_embeddings()`: Lazy load embeddings model
- `create_faiss_index()`: Create vector store from texts
- `retrieve_relevant_docs()`: Similarity search

---

#### 2.1.4 Chat Utilities Module
**File**: `backend/app/chat_utils.py`

**Purpose**: Chat model management and response generation

**Dependencies**:
```python
from langchain_openai import ChatOpenAI
import logging, os
from typing import Optional
```

**Constants**:
```python
MODEL = "gpt-4o"
TEMPERATURE = 0.7
```

**Functions**:
- `get_chat_model()`: Initialize chat model
- `ask_chat_model()`: Generate response

---

#### 2.1.5 Configuration Module
**File**: `backend/app/config.py`

**Purpose**: Environment configuration management

**Dependencies**:
```python
import os
from typing import Optional
```

**Functions**:
- `get_openai_api_key()`: Retrieve API key
- `get_allowed_origins()`: Get CORS origins

---

### 2.2 Frontend Modules

#### 2.2.1 Main App Component
**File**: `frontend/src/App.jsx`

**Purpose**: Root application component

**Dependencies**:
```javascript
import UploadArea from "./components/UploadArea";
import ChatInterface from "./components/ChatInterface";
import "./index.css";
```

**Structure**: Functional component with JSX layout

---

#### 2.2.2 Upload Area Component
**File**: `frontend/src/components/UploadArea.jsx`

**Purpose**: File upload interface with drag-and-drop

**Dependencies**:
```javascript
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadFiles } from "../api";
```

**State**:
- `uploading`: Boolean for upload in progress
- `error`: Error message string
- `success`: Boolean for successful upload

**Props**:
- `onUploadSuccess`: Callback function

---

#### 2.2.3 Chat Interface Component
**File**: `frontend/src/components/ChatInterface.jsx`

**Purpose**: Conversational chat interface

**Dependencies**:
```javascript
import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { sendChatMessage } from "../api";
```

**State**:
- `messages`: Array of message objects
- `input`: Current input string
- `loading`: Boolean for API call in progress

---

#### 2.2.4 API Service Module
**File**: `frontend/src/api.js`

**Purpose**: HTTP client for backend communication

**Dependencies**:
```javascript
import axios from 'axios';
```

**Functions**:
- `uploadFiles()`: Upload documents
- `sendChatMessage()`: Send chat query

---

## 3. Class Diagrams

### 3.1 Backend Class Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        AppState                              │
├─────────────────────────────────────────────────────────────┤
│ - vectorstore: Optional[FAISS]                              │
│ - chat_model: Optional[ChatOpenAI]                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      ChatRequest                             │
├─────────────────────────────────────────────────────────────┤
│ + message: str                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      FastAPI App                             │
├─────────────────────────────────────────────────────────────┤
│ + GET  /                                                     │
│ + POST /upload                                               │
│ + POST /chat                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Frontend Component Hierarchy

```
App
├── Header
│   ├── Logo
│   └── Title
└── Main
    ├── UploadArea
    │   ├── Dropzone
    │   ├── LoadingState
    │   ├── SuccessState
    │   └── ErrorState
    └── ChatInterface
        ├── Header
        ├── MessageList
        │   ├── UserMessage
        │   ├── AssistantMessage
        │   └── SystemMessage
        ├── LoadingIndicator
        └── InputForm
```

### 3.3 Data Flow Diagram

```
┌──────────────┐
│   User       │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│              Frontend Components                     │
│  ┌────────────────┐       ┌────────────────┐        │
│  │  UploadArea    │       │ ChatInterface  │        │
│  └────────┬───────┘       └────────┬───────┘        │
│           │                        │                 │
│           ▼                        ▼                 │
│  ┌─────────────────────────────────────────┐        │
│  │         API Service (api.js)            │        │
│  └─────────────────┬───────────────────────┘        │
└────────────────────┼──────────────────────────────── ┘
                     │
                     ▼ HTTP/REST
┌────────────────────────────────────────────────────────┐
│              Backend (FastAPI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ /upload      │  │  /chat       │  │  /          │ │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┘ │
│         │                 │                            │
│         ▼                 ▼                            │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │ pdf_utils    │  │ chat_utils   │                  │
│  └──────┬───────┘  └──────┬───────┘                  │
│         │                 │                            │
│         ▼                 ▼                            │
│  ┌─────────────────────────────────┐                  │
│  │   vectorstore_utils             │                  │
│  └─────────────┬───────────────────┘                  │
└────────────────┼──────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│              External Services                         │
│  ┌──────────────────────────────────────────────┐     │
│  │         OpenAI API                           │     │
│  │  • GPT-4o                                    │     │
│  │  • text-embedding-3-large                    │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Component Design

### 4.1 Backend Components

#### 4.1.1 AppState Class

**Purpose**: Maintain application state

**Definition**:
```python
class AppState:
    """Global application state container."""
    vectorstore: Optional[FAISS] = None
    chat_model: Optional[ChatOpenAI] = None
```

**Attributes**:

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `vectorstore` | `Optional[FAISS]` | FAISS vector store instance | `None` |
| `chat_model` | `Optional[ChatOpenAI]` | OpenAI chat model instance | `None` |

**Usage**:
```python
state = AppState()

# Set vectorstore after document upload
state.vectorstore = create_faiss_index(chunks)

# Initialize chat model on first query
if not state.chat_model:
    state.chat_model = get_chat_model(api_key)
```

---

#### 4.1.2 ChatRequest Model

**Purpose**: Pydantic model for chat request validation

**Definition**:
```python
class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str
```

**Attributes**:

| Attribute | Type | Required | Validation |
|-----------|------|----------|------------|
| `message` | `str` | Yes | Non-empty string |

**Example**:
```python
request = ChatRequest(message="What are the key provisions?")
```

---

#### 4.1.3 extract_text_from_pdf Function

**Signature**:
```python
def extract_text_from_pdf(file: Union[str, BinaryIO]) -> str
```

**Purpose**: Extract text content from PDF files

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | `Union[str, BinaryIO]` | File path or file-like object |

**Returns**:

| Type | Description |
|------|-------------|
| `str` | Extracted text content |

**Algorithm**:
```
1. Initialize PdfReader with file
2. Initialize empty text string
3. For each page in PDF:
   a. Extract text from page
   b. If text exists, append to result with space
4. Return trimmed text
5. On error, log error and return empty string
```

**Implementation**:
```python
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
```

**Time Complexity**: O(n) where n = number of pages  
**Space Complexity**: O(m) where m = total text length

**Error Handling**:
- Catches all exceptions
- Logs error message
- Returns empty string on failure

---

#### 4.1.4 get_embeddings Function

**Signature**:
```python
def get_embeddings() -> OpenAIEmbeddings
```

**Purpose**: Lazy load and cache OpenAI embeddings model

**Returns**:

| Type | Description |
|------|-------------|
| `OpenAIEmbeddings` | Cached embeddings model instance |

**Algorithm**:
```
1. Check if global cache exists
2. If not cached:
   a. Get API key from config
   b. Validate API key exists
   c. Initialize OpenAIEmbeddings with:
      - api_key
      - model="text-embedding-3-large"
   d. Store in global cache
3. Return cached instance
```

**Implementation**:
```python
_embeddings_cache = None

def get_embeddings():
    """Lazy load and cache OpenAI embeddings model."""
    global _embeddings_cache
    if _embeddings_cache is None:
        try:
            api_key = get_openai_api_key()
            if not api_key:
                logger.warning("OPENAI_API_KEY not set")
            
            _embeddings_cache = OpenAIEmbeddings(
                api_key=api_key, 
                model="text-embedding-3-large"
            )
        except Exception as e:
            logger.exception(f"Could not initialize embeddings: {e}")
            return None
    return _embeddings_cache
```

**Design Pattern**: Singleton (via global cache)

**Benefits**:
- Avoids repeated initialization
- Reduces API overhead
- Improves performance

---

#### 4.1.5 create_faiss_index Function

**Signature**:
```python
def create_faiss_index(texts: List[str]) -> FAISS
```

**Purpose**: Create FAISS vector store from text chunks

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `texts` | `List[str]` | List of text chunks to index |

**Returns**:

| Type | Description |
|------|-------------|
| `FAISS` | FAISS vector store instance |

**Algorithm**:
```
1. Get embeddings model instance
2. Validate embeddings model exists
3. Create FAISS index:
   a. Generate embeddings for all texts
   b. Build FAISS index structure
   c. Store texts and metadata
4. Return FAISS instance
```

**Implementation**:
```python
def create_faiss_index(texts: List[str]) -> FAISS:
    """
    Create a FAISS vector store from text chunks.
    
    Args:
        texts: List of text chunks to embed and index.
        
    Returns:
        FAISS vector store instance.
    """
    embeddings = get_embeddings()
    if embeddings is None:
        raise RuntimeError("Could not initialize embeddings model")
    return FAISS.from_texts(texts, embeddings)
```

**Time Complexity**: O(n * d) where n = number of texts, d = embedding dimension  
**Space Complexity**: O(n * d) for storing vectors

**Error Handling**:
- Raises RuntimeError if embeddings unavailable
- Propagates FAISS exceptions

---

#### 4.1.6 retrieve_relevant_docs Function

**Signature**:
```python
def retrieve_relevant_docs(
    vectorstore: FAISS, 
    query: str, 
    k: int = 4
) -> List[Document]
```

**Purpose**: Retrieve most relevant documents using similarity search

**Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `vectorstore` | `FAISS` | - | FAISS vector store instance |
| `query` | `str` | - | Search query string |
| `k` | `int` | `4` | Number of documents to retrieve |

**Returns**:

| Type | Description |
|------|-------------|
| `List[Document]` | List of relevant document chunks |

**Algorithm**:
```
1. Embed query using same embeddings model
2. Perform cosine similarity search in FAISS
3. Return top k documents sorted by similarity
```

**Implementation**:
```python
def retrieve_relevant_docs(
    vectorstore: FAISS, 
    query: str, 
    k: int = 4
) -> List[Document]:
    """
    Retrieve relevant documents from vector store.
    
    Args:
        vectorstore: FAISS vector store instance.
        query: Search query string.
        k: Number of documents to retrieve (default: 4).
        
    Returns:
        List of relevant documents.
    """
    return vectorstore.similarity_search(query, k=k)
```

**Time Complexity**: O(n) for flat index, O(log n) for IVF index  
**Space Complexity**: O(k) for results

---

#### 4.1.7 get_chat_model Function

**Signature**:
```python
def get_chat_model(api_key: Optional[str] = None) -> ChatOpenAI
```

**Purpose**: Initialize OpenAI chat model

**Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `api_key` | `Optional[str]` | `None` | OpenAI API key (uses env if None) |

**Returns**:

| Type | Description |
|------|-------------|
| `ChatOpenAI` | Initialized chat model instance |

**Algorithm**:
```
1. Determine API key (parameter or environment)
2. Validate API key exists
3. Initialize ChatOpenAI with:
   - api_key
   - model="gpt-4o"
   - temperature=0.7
4. Return model instance
```

**Implementation**:
```python
MODEL = "gpt-4o"
TEMPERATURE = 0.7

def get_chat_model(api_key: Optional[str] = None) -> ChatOpenAI:
    """Initialize the OpenAI Chat Model."""
    try:
        final_api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not final_api_key:
            raise ValueError(
                "OPENAI_API_KEY not found. Please set it in environment."
            )
        
        return ChatOpenAI(
            api_key=final_api_key, 
            model=MODEL, 
            temperature=TEMPERATURE
        )
    except Exception as e:
        logger.error(f"Failed to initialize chat model: {str(e)}")
        raise e
```

**Error Handling**:
- Raises ValueError if API key missing
- Logs and re-raises initialization errors

---

#### 4.1.8 ask_chat_model Function

**Signature**:
```python
def ask_chat_model(chat_model: ChatOpenAI, prompt: str) -> str
```

**Purpose**: Generate response from chat model

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `chat_model` | `ChatOpenAI` | Initialized chat model |
| `prompt` | `str` | Complete prompt with context |

**Returns**:

| Type | Description |
|------|-------------|
| `str` | Generated response text |

**Algorithm**:
```
1. Validate chat model exists
2. Invoke model with prompt
3. Extract content from response
4. Return response text
```

**Implementation**:
```python
def ask_chat_model(chat_model: ChatOpenAI, prompt: str) -> str:
    """Send a prompt to the chat model and return the response."""
    if chat_model is None:
        return "Chat model is not available."
    
    try:
        response = chat_model.invoke(prompt)
        return response.content
    except Exception as e:
        logger.error(f"Error invoking chat model: {str(e)}")
        return "I'm sorry, but I encountered an error."
```

**Error Handling**:
- Returns fallback message if model unavailable
- Catches and logs invocation errors
- Returns user-friendly error message

---

#### 4.1.9 upload_files Endpoint

**Signature**:
```python
@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...))
```

**Purpose**: Handle document upload and processing

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `files` | `List[UploadFile]` | List of uploaded PDF files |

**Returns**:

| Type | Description |
|------|-------------|
| `dict` | Status response with document count and chunks |

**Algorithm**:
```
1. Initialize empty text list
2. For each uploaded file:
   a. Create temporary file
   b. Copy upload to temp file
   c. Extract text from PDF
   d. Add text to list
   e. Delete temp file
3. Initialize text splitter (1000 chars, 200 overlap)
4. Split all texts into chunks
5. If chunks exist:
   a. Create FAISS index
   b. Store in AppState
   c. Return success response
6. Else:
   a. Return warning response
```

**Implementation**:
```python
@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload and process PDF documents."""
    try:
        all_texts = []
        for file in files:
            with tempfile.NamedTemporaryFile(
                delete=False, 
                suffix=".pdf"
            ) as tmp_file:
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
            return {
                "status": "warning", 
                "message": "No text extracted"
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Response Examples**:

Success:
```json
{
  "status": "success",
  "message": "Processed 2 documents",
  "chunks": 45
}
```

Warning:
```json
{
  "status": "warning",
  "message": "No text extracted from documents"
}
```

Error:
```json
{
  "detail": "Error processing documents: <error_message>"
}
```

---

#### 4.1.10 chat Endpoint

**Signature**:
```python
@app.post("/chat")
async def chat(request: ChatRequest)
```

**Purpose**: Handle chat queries

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `request` | `ChatRequest` | Chat request with message |

**Returns**:

| Type | Description |
|------|-------------|
| `dict` | Response with generated answer |

**Algorithm**:
```
1. Validate vectorstore exists
2. If chat model not initialized:
   a. Get API key
   b. Initialize chat model
   c. Store in AppState
3. Retrieve relevant documents (k=4)
4. Extract text from documents
5. Construct prompt:
   - System instructions
   - Document context
   - User question
6. Generate response using chat model
7. Return response
```

**Implementation**:
```python
@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat endpoint for interacting with documents."""
    if not state.vectorstore:
        raise HTTPException(
            status_code=400, 
            detail="Please upload documents first"
        )
    
    if not state.chat_model:
        try:
            api_key = get_openai_api_key()
            state.chat_model = get_chat_model(api_key)
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to initialize chat model: {str(e)}"
            )
    
    try:
        relevant_docs = retrieve_relevant_docs(
            state.vectorstore, 
            request.message
        )
        context = "\n\n".join([
            doc.page_content for doc in relevant_docs
        ])
        
        system_prompt = f"""You are NaviOwl Assistant.
Based on the provided documents, provide accurate answers.
If information is not in documents, clearly state that.

Documents:
{context}

User Question: {request.message}

Answer:"""
        
        response = ask_chat_model(state.chat_model, system_prompt)
        return {"response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Response Example**:
```json
{
  "response": "Based on the documents, the key provisions include..."
}
```

**Error Responses**:
- 400: No documents uploaded
- 500: Chat model initialization failed
- 500: Query processing error

---

### 4.2 Frontend Components

#### 4.2.1 UploadArea Component

**Purpose**: File upload interface with drag-and-drop

**Props**:
```typescript
interface UploadAreaProps {
  onUploadSuccess: () => void;
}
```

**State**:
```typescript
interface UploadAreaState {
  uploading: boolean;
  error: string | null;
  success: boolean;
}
```

**Hooks**:
```javascript
const [uploading, setUploading] = useState(false);
const [error, setError] = useState(null);
const [success, setSuccess] = useState(false);
```

**Event Handlers**:

**onDrop**:
```javascript
const onDrop = useCallback(async (acceptedFiles) => {
  if (acceptedFiles.length === 0) return;
  
  setUploading(true);
  setError(null);
  setSuccess(false);
  
  try {
    const result = await uploadFiles(acceptedFiles);
    setSuccess(true);
    onUploadSuccess();
    setTimeout(() => setSuccess(false), 3000);
  } catch (err) {
    setError(err);
  } finally {
    setUploading(false);
  }
}, [onUploadSuccess]);
```

**Algorithm**:
```
1. Validate files exist
2. Set uploading state to true
3. Clear previous error and success states
4. Try:
   a. Call uploadFiles API
   b. Set success state
   c. Trigger onUploadSuccess callback
   d. Clear success after 3 seconds
5. Catch error:
   a. Set error state
6. Finally:
   a. Set uploading to false
```

**Dropzone Configuration**:
```javascript
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: { "application/pdf": [".pdf"] },
  multiple: true,
});
```

**UI States**:

1. **Idle State**: Default upload prompt
2. **Uploading State**: Loading spinner with "Analyzing documents..."
3. **Success State**: Green checkmark with success message
4. **Error State**: Red alert with error message

---

#### 4.2.2 ChatInterface Component

**Purpose**: Conversational chat interface

**State**:
```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatInterfaceState {
  messages: Message[];
  input: string;
  loading: boolean;
}
```

**Hooks**:
```javascript
const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const messagesEndRef = useRef(null);
```

**Event Handlers**:

**handleSend**:
```javascript
const handleSend = async (e) => {
  e.preventDefault();
  if (!input.trim() || loading) return;
  
  const userMessage = { role: "user", content: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setLoading(true);
  
  try {
    const response = await sendChatMessage(userMessage.content);
    const botMessage = { 
      role: "assistant", 
      content: response.response 
    };
    setMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    const errorMessage = { 
      role: "system", 
      content: `Error: ${error}` 
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setLoading(false);
  }
};
```

**Algorithm**:
```
1. Prevent default form submission
2. Validate input is not empty and not loading
3. Create user message object
4. Add user message to messages array
5. Clear input field
6. Set loading to true
7. Try:
   a. Call sendChatMessage API
   b. Create assistant message with response
   c. Add assistant message to array
8. Catch error:
   a. Create system error message
   b. Add error message to array
9. Finally:
   a. Set loading to false
```

**Auto-scroll Effect**:
```javascript
const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

useEffect(() => {
  scrollToBottom();
}, [messages]);
```

**Message Rendering**:
- User messages: Right-aligned, primary color background
- Assistant messages: Left-aligned, gray background
- System messages: Left-aligned, red background (errors)

---

#### 4.2.3 API Service

**Purpose**: HTTP client for backend communication

**Configuration**:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

**uploadFiles Function**:

**Signature**:
```javascript
export const uploadFiles = async (files) => { ... }
```

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `files` | `File[]` | Array of File objects |

**Returns**:

| Type | Description |
|------|-------------|
| `Promise<Object>` | Upload response data |

**Implementation**:
```javascript
export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/upload`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Upload failed';
  }
};
```

**Algorithm**:
```
1. Create FormData object
2. Append each file to FormData
3. Send POST request to /upload
4. Set Content-Type header
5. Return response data
6. On error, extract error message or use default
```

---

**sendChatMessage Function**:

**Signature**:
```javascript
export const sendChatMessage = async (message) => { ... }
```

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `message` | `string` | User query text |

**Returns**:

| Type | Description |
|------|-------------|
| `Promise<Object>` | Chat response data |

**Implementation**:
```javascript
export const sendChatMessage = async (message) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/chat`,
      { message }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Chat request failed';
  }
};
```

**Algorithm**:
```
1. Send POST request to /chat
2. Include message in request body
3. Return response data
4. On error, extract error message or use default
```

---

## 5. Algorithms & Logic

### 5.1 Document Processing Pipeline

**Algorithm**: Document Upload and Indexing

**Input**: List of PDF files  
**Output**: FAISS vector store

**Pseudocode**:
```
FUNCTION process_documents(files):
    all_texts = []
    
    FOR EACH file IN files:
        temp_path = create_temp_file(file)
        text = extract_text_from_pdf(temp_path)
        all_texts.append(text)
        delete_temp_file(temp_path)
    END FOR
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    
    chunks = []
    FOR EACH text IN all_texts:
        text_chunks = text_splitter.split(text)
        chunks.extend(text_chunks)
    END FOR
    
    IF chunks is not empty:
        embeddings = get_embeddings_model()
        vectorstore = create_faiss_index(chunks, embeddings)
        RETURN vectorstore
    ELSE:
        RETURN null
    END IF
END FUNCTION
```

**Time Complexity**: O(n * m) where n = number of files, m = average pages per file  
**Space Complexity**: O(k * d) where k = number of chunks, d = embedding dimension (3072)

---

### 5.2 RAG Query Processing

**Algorithm**: Retrieval-Augmented Generation

**Input**: User query string  
**Output**: Generated response

**Pseudocode**:
```
FUNCTION process_query(query, vectorstore, chat_model):
    // Step 1: Embed query
    query_embedding = embed_text(query)
    
    // Step 2: Similarity search
    relevant_docs = vectorstore.similarity_search(
        query_embedding, 
        k=4
    )
    
    // Step 3: Extract context
    context = ""
    FOR EACH doc IN relevant_docs:
        context += doc.content + "\n\n"
    END FOR
    
    // Step 4: Construct prompt
    prompt = f"""
    You are an intelligent assistant.
    Based on the following documents, answer the question.
    
    Documents:
    {context}
    
    Question: {query}
    
    Answer:
    """
    
    // Step 5: Generate response
    response = chat_model.invoke(prompt)
    
    RETURN response.content
END FUNCTION
```

**Time Complexity**: 
- Embedding: O(1) - API call
- Search: O(n) for flat index
- Generation: O(1) - API call
- Total: O(n)

**Space Complexity**: O(k) where k = number of retrieved documents

---

### 5.3 Text Chunking Algorithm

**Algorithm**: Recursive Character Text Splitting

**Input**: Text string  
**Output**: List of text chunks

**Pseudocode**:
```
FUNCTION split_text(text, chunk_size, overlap):
    chunks = []
    start = 0
    text_length = length(text)
    
    WHILE start < text_length:
        end = min(start + chunk_size, text_length)
        
        // Find sentence boundary
        IF end < text_length:
            // Look for period, newline, or space
            boundary = find_boundary(text, end)
            IF boundary > start:
                end = boundary
            END IF
        END IF
        
        chunk = text[start:end]
        chunks.append(chunk)
        
        // Move start with overlap
        start = end - overlap
        
        // Ensure progress
        IF start <= previous_start:
            start = previous_start + 1
        END IF
    END WHILE
    
    RETURN chunks
END FUNCTION
```

**Time Complexity**: O(n) where n = text length  
**Space Complexity**: O(n) for storing chunks

**Parameters**:
- `chunk_size`: 1000 characters
- `overlap`: 200 characters

**Benefits**:
- Preserves context across chunks
- Respects sentence boundaries
- Prevents information loss

---

### 5.4 Similarity Search Algorithm

**Algorithm**: FAISS Flat Index Search

**Input**: Query vector, k  
**Output**: Top k similar documents

**Pseudocode**:
```
FUNCTION similarity_search(query_vector, k):
    // Compute distances to all vectors
    distances = []
    FOR EACH doc_vector IN index:
        distance = cosine_similarity(query_vector, doc_vector)
        distances.append((distance, doc_vector))
    END FOR
    
    // Sort by distance (descending for similarity)
    distances.sort(reverse=True)
    
    // Return top k
    results = distances[0:k]
    
    RETURN results
END FUNCTION
```

**Time Complexity**: O(n * d) where n = number of documents, d = dimension  
**Space Complexity**: O(n) for distance array

**Optimization**: Use FAISS IVF index for large datasets (O(log n) search)

---

## 6. Data Structures

### 6.1 Message Structure

**Purpose**: Represent chat messages

**Definition**:
```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `role` | `'user' \| 'assistant' \| 'system'` | Message sender |
| `content` | `string` | Message text |
| `timestamp` | `Date` (optional) | Message creation time |

**Example**:
```javascript
{
  role: "user",
  content: "What are the key provisions?",
  timestamp: new Date()
}
```

---

### 6.2 Document Structure

**Purpose**: Represent text chunks with metadata

**Definition** (LangChain):
```python
class Document:
    page_content: str
    metadata: Dict[str, Any]
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `page_content` | `str` | Text content |
| `metadata` | `Dict` | Additional information |

**Example**:
```python
Document(
    page_content="The overtime rate is 1.5x...",
    metadata={
        "source": "cba_2024.pdf",
        "page": 15
    }
)
```

---

### 6.3 Vector Store Structure

**Purpose**: Store and search document embeddings

**FAISS Index**:
```
Index {
    dimension: 3072,
    vectors: np.ndarray[n, 3072],
    documents: List[Document],
    index_type: "Flat" | "IVF"
}
```

**Operations**:

| Operation | Time Complexity | Description |
|-----------|----------------|-------------|
| `add(vectors)` | O(n * d) | Add vectors to index |
| `search(query, k)` | O(n * d) | Find k nearest neighbors |
| `remove(ids)` | O(n) | Remove vectors by ID |

---

### 6.4 State Structure

**Purpose**: Application state container

**Definition**:
```python
class AppState:
    vectorstore: Optional[FAISS]
    chat_model: Optional[ChatOpenAI]
```

**Lifecycle**:
```
Initial: {vectorstore: None, chat_model: None}
         ↓
After Upload: {vectorstore: FAISS(...), chat_model: None}
         ↓
After First Query: {vectorstore: FAISS(...), chat_model: ChatOpenAI(...)}
```

---

## 7. Error Handling

### 7.1 Backend Error Handling

#### 7.1.1 PDF Extraction Errors

**Error Type**: Corrupted or invalid PDF

**Handling**:
```python
try:
    reader = PdfReader(file)
    text = extract_pages(reader)
except Exception as e:
    logger.error(f"Error extracting PDF: {e}")
    return ""  # Return empty string
```

**Strategy**: Graceful degradation

---

#### 7.1.2 API Key Errors

**Error Type**: Missing or invalid OpenAI API key

**Handling**:
```python
if not api_key:
    raise ValueError("OPENAI_API_KEY not found")
```

**HTTP Response**: 500 Internal Server Error

**User Message**: "Failed to initialize chat model: Invalid API key"

---

#### 7.1.3 Vector Store Errors

**Error Type**: No documents uploaded

**Handling**:
```python
if not state.vectorstore:
    raise HTTPException(
        status_code=400,
        detail="Please upload documents first"
    )
```

**HTTP Response**: 400 Bad Request

---

#### 7.1.4 Chat Model Errors

**Error Type**: Model invocation failure

**Handling**:
```python
try:
    response = chat_model.invoke(prompt)
    return response.content
except Exception as e:
    logger.error(f"Error invoking model: {e}")
    return "I'm sorry, but I encountered an error."
```

**Strategy**: Return user-friendly error message

---

### 7.2 Frontend Error Handling

#### 7.2.1 Upload Errors

**Error Type**: Network or server error

**Handling**:
```javascript
try {
  const result = await uploadFiles(acceptedFiles);
  setSuccess(true);
} catch (err) {
  setError(err);  // Display error to user
}
```

**UI**: Red alert box with error message

---

#### 7.2.2 Chat Errors

**Error Type**: API request failure

**Handling**:
```javascript
try {
  const response = await sendChatMessage(message);
  // Add response to messages
} catch (error) {
  const errorMessage = {
    role: "system",
    content: `Error: ${error}`
  };
  setMessages((prev) => [...prev, errorMessage]);
}
```

**UI**: System message in chat with error details

---

### 7.3 Error Response Format

**Standard Error Response**:
```json
{
  "detail": "Error message describing the issue"
}
```

**HTTP Status Codes**:

| Code | Meaning | Usage |
|------|---------|-------|
| 400 | Bad Request | Invalid input, missing documents |
| 500 | Internal Server Error | Processing errors, API failures |

---

## 8. Testing Strategy

### 8.1 Unit Tests

#### 8.1.1 Backend Unit Tests

**Test File**: `backend/tests/test_pdf_utils.py`

**Test Cases**:
```python
def test_extract_text_from_valid_pdf():
    """Test text extraction from valid PDF."""
    text = extract_text_from_pdf("sample.pdf")
    assert len(text) > 0
    assert isinstance(text, str)

def test_extract_text_from_corrupted_pdf():
    """Test handling of corrupted PDF."""
    text = extract_text_from_pdf("corrupted.pdf")
    assert text == ""  # Should return empty string

def test_extract_text_from_nonexistent_file():
    """Test handling of missing file."""
    text = extract_text_from_pdf("nonexistent.pdf")
    assert text == ""
```

---

**Test File**: `backend/tests/test_vectorstore_utils.py`

**Test Cases**:
```python
def test_create_faiss_index():
    """Test FAISS index creation."""
    texts = ["Sample text 1", "Sample text 2"]
    index = create_faiss_index(texts)
    assert index is not None
    assert index.index.ntotal == 2

def test_retrieve_relevant_docs():
    """Test document retrieval."""
    texts = ["CBA provisions", "Overtime rules"]
    index = create_faiss_index(texts)
    docs = retrieve_relevant_docs(index, "overtime", k=1)
    assert len(docs) == 1
    assert "Overtime" in docs[0].page_content
```

---

#### 8.1.2 Frontend Unit Tests

**Test File**: `frontend/src/components/__tests__/ChatInterface.test.jsx`

**Test Cases**:
```javascript
describe('ChatInterface', () => {
  test('renders chat interface', () => {
    render(<ChatInterface />);
    expect(screen.getByPlaceholderText(/ask a question/i))
      .toBeInTheDocument();
  });
  
  test('sends message on form submit', async () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/ask a question/i);
    const button = screen.getByRole('button');
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Test question')).toBeInTheDocument();
    });
  });
});
```

---

### 8.2 Integration Tests

**Test File**: `backend/tests/test_integration.py`

**Test Cases**:
```python
def test_upload_and_chat_flow():
    """Test complete upload and chat flow."""
    # Upload documents
    with open("test.pdf", "rb") as f:
        response = client.post(
            "/upload",
            files={"files": ("test.pdf", f, "application/pdf")}
        )
    assert response.status_code == 200
    
    # Send chat query
    response = client.post(
        "/chat",
        json={"message": "What is in the document?"}
    )
    assert response.status_code == 200
    assert "response" in response.json()
```

---

### 8.3 End-to-End Tests

**Tool**: Playwright or Cypress

**Test Scenario**:
```javascript
test('complete user flow', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:5173');
  
  // Upload document
  await page.setInputFiles('input[type="file"]', 'test.pdf');
  await page.waitForSelector('text=Documents processed');
  
  // Send chat message
  await page.fill('input[placeholder*="Ask"]', 'Test question');
  await page.click('button[type="submit"]');
  
  // Verify response
  await page.waitForSelector('text=Based on the documents');
});
```

---

## 9. Code Standards

### 9.1 Python Code Standards

#### 9.1.1 Style Guide

**Standard**: PEP 8

**Key Rules**:
- Indentation: 4 spaces
- Line length: 88 characters (Black formatter)
- Naming: snake_case for functions/variables, PascalCase for classes
- Imports: Grouped (standard library, third-party, local)

**Example**:
```python
from typing import List, Optional
import logging

from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)


def process_documents(files: List[str]) -> Optional[FAISS]:
    """
    Process documents and create vector store.
    
    Args:
        files: List of file paths.
        
    Returns:
        FAISS vector store or None.
    """
    # Implementation
    pass
```

---

#### 9.1.2 Type Hints

**Requirement**: All function signatures must have type hints

**Example**:
```python
def extract_text_from_pdf(file: Union[str, BinaryIO]) -> str:
    """Extract text from PDF."""
    pass

def create_faiss_index(texts: List[str]) -> FAISS:
    """Create FAISS index."""
    pass
```

---

#### 9.1.3 Docstrings

**Format**: Google style

**Example**:
```python
def retrieve_relevant_docs(
    vectorstore: FAISS, 
    query: str, 
    k: int = 4
) -> List[Document]:
    """
    Retrieve relevant documents from vector store.
    
    Args:
        vectorstore: FAISS vector store instance.
        query: Search query string.
        k: Number of documents to retrieve (default: 4).
        
    Returns:
        List of relevant documents sorted by similarity.
        
    Raises:
        ValueError: If vectorstore is None.
    """
    pass
```

---

### 9.2 JavaScript Code Standards

#### 9.2.1 Style Guide

**Standard**: ESLint with React plugin

**Key Rules**:
- Indentation: 2 spaces
- Quotes: Double quotes for JSX, single for JS
- Semicolons: Required
- Arrow functions: Preferred for callbacks

**Example**:
```javascript
import { useState, useEffect } from 'react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Effect logic
  }, [messages]);
  
  const handleSend = async (message) => {
    // Handler logic
  };
  
  return (
    <div className="chat-interface">
      {/* JSX */}
    </div>
  );
};

export default ChatInterface;
```

---

#### 9.2.2 Component Structure

**Order**:
1. Imports
2. Component definition
3. State declarations
4. Effects
5. Event handlers
6. Render logic
7. Export

**Example**:
```javascript
// 1. Imports
import { useState } from 'react';
import { sendMessage } from '../api';

// 2. Component
const MyComponent = ({ prop1, prop2 }) => {
  // 3. State
  const [state, setState] = useState(null);
  
  // 4. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 5. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 6. Render
  return <div>...</div>;
};

// 7. Export
export default MyComponent;
```

---

#### 9.2.3 Naming Conventions

**Components**: PascalCase
```javascript
const ChatInterface = () => { ... };
```

**Functions**: camelCase
```javascript
const handleSend = () => { ... };
const sendChatMessage = async () => { ... };
```

**Constants**: UPPER_SNAKE_CASE
```javascript
const API_BASE_URL = 'http://localhost:8000';
const MAX_FILE_SIZE = 50 * 1024 * 1024;
```

---

### 9.3 CSS Standards

#### 9.3.1 Naming Convention

**Standard**: BEM (Block Element Modifier)

**Example**:
```css
.chat-interface { }
.chat-interface__header { }
.chat-interface__message { }
.chat-interface__message--user { }
.chat-interface__message--assistant { }
```

---

#### 9.3.2 CSS Variables

**Usage**: Define in `:root` for theming

**Example**:
```css
:root {
  --primary: #00A67E;
  --primary-dark: #008C6A;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --radius-sm: 8px;
  --radius-lg: 16px;
}

.button {
  background-color: var(--primary);
  border-radius: var(--radius-sm);
}
```

---

## 10. Appendix

### 10.1 File Structure Reference

```
NaviOwl-V2/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py              # Configuration utilities
│   │   ├── pdf_utils.py           # PDF extraction
│   │   ├── vectorstore_utils.py   # FAISS operations
│   │   └── chat_utils.py          # Chat model management
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_pdf_utils.py
│   │   ├── test_vectorstore_utils.py
│   │   └── test_integration.py
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # Environment variables
├── frontend/
│   ├── public/
│   │   └── logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx  # Chat UI
│   │   │   ├── UploadArea.jsx     # Upload UI
│   │   │   └── __tests__/
│   │   │       ├── ChatInterface.test.jsx
│   │   │       └── UploadArea.test.jsx
│   │   ├── App.jsx                # Main component
│   │   ├── main.jsx               # Entry point
│   │   ├── index.css              # Global styles
│   │   └── api.js                 # API client
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
├── .env.example
├── run_app.sh
├── README.md
├── PRD.md
├── HLD.md
└── LLD.md
```

---

### 10.2 Dependencies Reference

**Backend**:
```
fastapi>=0.100.0
uvicorn>=0.20.0
python-multipart>=0.0.6
pypdf>=3.0.0
langchain-openai>=0.0.5
langchain-community>=0.0.10
langchain-text-splitters>=0.0.1
faiss-cpu>=1.7.4
python-dotenv>=1.0.0
```

**Frontend**:
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "vite": "^7.2.4",
  "axios": "^1.13.2",
  "framer-motion": "^12.24.12",
  "lucide-react": "^0.562.0",
  "react-dropzone": "^14.3.8"
}
```

---

### 10.3 Configuration Reference

**Environment Variables**:
```env
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Application Constants**:
```python
# Chat Model
MODEL = "gpt-4o"
TEMPERATURE = 0.7

# Embedding Model
EMBEDDING_MODEL = "text-embedding-3-large"

# Text Chunking
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Retrieval
TOP_K = 4
```

---

### 10.4 API Quick Reference

**Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Health check |
| POST | `/upload` | Upload PDFs |
| POST | `/chat` | Query documents |

**Request/Response Examples**:

Upload:
```bash
curl -X POST http://localhost:8000/upload \
  -F "files=@doc.pdf"
```

Chat:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the key provisions?"}'
```

---

**Document Version**: 1.0  
**Last Updated**: February 7, 2026  
**Status**: Active Development  
**Next Review**: March 7, 2026

---

**End of Document**
