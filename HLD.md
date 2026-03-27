# High Level Design (HLD)
## NaviOwl: Intelligent Document Assistant

---

**Document Information**

| Field | Details |
|-------|---------|
| **Product Name** | Intelligent Document Assistant |
| **Version** | 2.0 |
| **Document Date** | February 7, 2026 |
| **Document Type** | High Level Design |
| **Status** | Active Development |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Component Design](#3-component-design)
4. [Data Flow](#4-data-flow)
5. [API Specifications](#5-api-specifications)
6. [Database Design](#6-database-design)
7. [Security Architecture](#7-security-architecture)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Performance Considerations](#9-performance-considerations)
10. [Appendix](#10-appendix)

---

## 1. Introduction

### 1.1 Purpose

This High Level Design (HLD) document provides a comprehensive technical overview of the Intelligent Document Assistant system architecture. It serves as a blueprint for developers, architects, and stakeholders to understand the system's structure, components, and interactions.

### 1.2 Scope

This document covers:
- System architecture and design patterns
- Component interactions and responsibilities
- Data flow and processing pipelines
- API specifications and contracts
- Security and deployment considerations

### 1.3 System Overview

Intelligent Document Assistant is an AI-powered document intelligence platform that enables users to interact with complex documents through natural language. The system uses Retrieval-Augmented Generation (RAG) to provide accurate, source-grounded responses.

**Key Characteristics:**
- **Architecture**: Microservices with decoupled frontend and backend
- **AI Framework**: LangChain with OpenAI GPT-4o
- **Vector Database**: FAISS for semantic search
- **Deployment**: Containerized with Docker support

---

## 2. System Architecture

### 2.1 Architectural Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React Single Page Application                │  │
│  │                                                            │  │
│  │  Components:                                               │  │
│  │  • UploadArea (File Upload UI)                            │  │
│  │  • ChatInterface (Conversational UI)                      │  │
│  │  • App (Main Container)                                   │  │
│  │                                                            │  │
│  │  Services:                                                 │  │
│  │  • API Service (Axios HTTP Client)                        │  │
│  │  • State Management (React Hooks)                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST (Port 5173 → 8000)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   FastAPI Application                     │  │
│  │                                                            │  │
│  │  Middleware:                                               │  │
│  │  • CORS Middleware (Security)                             │  │
│  │  • Lifespan Manager (Startup/Shutdown)                    │  │
│  │                                                            │  │
│  │  Endpoints:                                                │  │
│  │  • GET  /           (Health Check)                        │  │
│  │  • POST /upload     (Document Processing)                 │  │
│  │  • POST /chat       (Query Handling)                      │  │
│  │                                                            │  │
│  │  State:                                                    │  │
│  │  • AppState (vectorstore, chat_model)                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BUSINESS LOGIC LAYER                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PDF Utils   │  │Vector Store  │  │  Chat Utils  │          │
│  │              │  │    Utils     │  │              │          │
│  │              │  │              │  │              │          │
│  │ • extract_   │  │ • create_    │  │ • get_chat_  │          │
│  │   text_from_ │  │   faiss_     │  │   model()    │          │
│  │   pdf()      │  │   index()    │  │              │          │
│  │              │  │ • retrieve_  │  │ • ask_chat_  │          │
│  │              │  │   relevant_  │  │   model()    │          │
│  │              │  │   docs()     │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐                                               │
│  │   Config     │                                               │
│  │              │                                               │
│  │ • get_openai_│                                               │
│  │   api_key()  │                                               │
│  │ • get_       │                                               │
│  │   allowed_   │                                               │
│  │   origins()  │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │    FAISS     │  │  LangChain   │                            │
│  │ Vector Store │  │  Components  │                            │
│  │              │  │              │                            │
│  │ • In-Memory  │  │ • Text       │                            │
│  │   Index      │  │   Splitters  │                            │
│  │ • Similarity │  │ • Embeddings │                            │
│  │   Search     │  │              │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    OpenAI API                             │  │
│  │                                                            │  │
│  │  • GPT-4o (Chat Completions)                              │  │
│  │  • text-embedding-3-large (Embeddings)                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Design Patterns

#### 2.2.1 Layered Architecture
- **Presentation Layer**: React components for UI
- **Application Layer**: FastAPI for request handling
- **Business Logic Layer**: Utility modules for processing
- **Data Layer**: Vector store and LangChain components
- **External Services**: OpenAI API integration

#### 2.2.2 Microservices Pattern
- Frontend and backend are independently deployable
- Communication via REST API
- Loose coupling enables independent scaling

#### 2.2.3 Repository Pattern
- Utility modules encapsulate data access logic
- `vectorstore_utils.py` manages FAISS operations
- `pdf_utils.py` handles document processing

#### 2.2.4 Singleton Pattern
- `AppState` maintains single instance of vectorstore and chat model
- Embeddings cache prevents redundant initialization

---

## 3. Component Design

### 3.1 Frontend Components

#### 3.1.1 App Component
**File**: `frontend/src/App.jsx`

**Responsibilities**:
- Main application container
- Layout management
- Component composition

**Structure**:
```jsx
App
├── Header
│   ├── Logo
│   └── Title
├── Main Container
│   ├── Left Panel
│   │   ├── Upload Section
│   │   │   └── UploadArea Component
│   │   └── Privacy Notice
│   └── Right Panel
│       └── ChatInterface Component
```

#### 3.1.2 UploadArea Component
**File**: `frontend/src/components/UploadArea.jsx`

**Responsibilities**:
- File upload UI (drag-and-drop)
- File validation
- Upload progress tracking
- API communication for document upload

**Key Features**:
- React Dropzone integration
- Multi-file support
- Visual feedback (loading states)
- Error handling

**Props**:
```typescript
interface UploadAreaProps {
  onUploadSuccess: () => void;
}
```

#### 3.1.3 ChatInterface Component
**File**: `frontend/src/components/ChatInterface.jsx`

**Responsibilities**:
- Chat message display
- User input handling
- Message history management
- API communication for queries

**State Management**:
```javascript
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

**Message Structure**:
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

#### 3.1.4 API Service
**File**: `frontend/src/api.js`

**Responsibilities**:
- HTTP request abstraction
- Error handling
- Base URL configuration

**Methods**:
```javascript
uploadDocuments(files: File[]): Promise<UploadResponse>
sendChatMessage(message: string): Promise<ChatResponse>
```

---

### 3.2 Backend Components

#### 3.2.1 Main Application
**File**: `backend/main.py`

**Responsibilities**:
- FastAPI application initialization
- Middleware configuration
- Endpoint routing
- Application state management

**Key Components**:
```python
class AppState:
    vectorstore: Optional[FAISS] = None
    chat_model: Optional[ChatOpenAI] = None

app = FastAPI(
    title="NaviOwl API",
    description="Backend for intelligent document assistance",
    lifespan=lifespan
)
```

**Endpoints**:
- `GET /`: Health check
- `POST /upload`: Document upload and processing
- `POST /chat`: Query handling

#### 3.2.2 PDF Utilities
**File**: `backend/app/pdf_utils.py`

**Responsibilities**:
- PDF text extraction
- Error handling for corrupted files

**Functions**:
```python
def extract_text_from_pdf(file: Union[str, BinaryIO]) -> str:
    """
    Extracts text from a PDF file.
    
    Args:
        file: File path or file-like object
        
    Returns:
        Extracted text as string
    """
```

**Implementation**:
- Uses PyPDF library
- Page-by-page extraction
- Text concatenation

#### 3.2.3 Vector Store Utilities
**File**: `backend/app/vectorstore_utils.py`

**Responsibilities**:
- FAISS index creation
- Embedding generation
- Similarity search

**Functions**:
```python
def get_embeddings() -> OpenAIEmbeddings:
    """Lazy load and cache OpenAI embeddings model."""

def create_faiss_index(texts: List[str]) -> FAISS:
    """Create FAISS vector store from text chunks."""

def retrieve_relevant_docs(
    vectorstore: FAISS, 
    query: str, 
    k: int = 4
) -> List[Document]:
    """Retrieve relevant documents from vector store."""
```

**Caching Strategy**:
- Global embeddings cache to avoid re-initialization
- Singleton pattern for embeddings model

#### 3.2.4 Chat Utilities
**File**: `backend/app/chat_utils.py`

**Responsibilities**:
- Chat model initialization
- Response generation
- Error handling

**Functions**:
```python
def get_chat_model(api_key: Optional[str] = None) -> ChatOpenAI:
    """Initialize OpenAI Chat Model."""

def ask_chat_model(chat_model: ChatOpenAI, prompt: str) -> str:
    """Send prompt to chat model and return response."""
```

**Configuration**:
```python
MODEL = "gpt-4o"
TEMPERATURE = 0.7
```

#### 3.2.5 Configuration Module
**File**: `backend/app/config.py`

**Responsibilities**:
- Environment variable management
- Configuration retrieval

**Functions**:
```python
def get_openai_api_key() -> Optional[str]:
    """Return OpenAI API key from environment."""

def get_allowed_origins() -> List[str]:
    """Return list of allowed CORS origins."""
```

---

## 4. Data Flow

### 4.1 Document Upload Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Select PDF files
     ▼
┌─────────────────┐
│  UploadArea     │
│  Component      │
└────┬────────────┘
     │ 2. Validate files (type, size)
     │ 3. Create FormData
     ▼
┌─────────────────┐
│  API Service    │
│  (uploadDocs)   │
└────┬────────────┘
     │ 4. POST /upload (multipart/form-data)
     ▼
┌─────────────────┐
│  FastAPI        │
│  /upload        │
└────┬────────────┘
     │ 5. Receive files
     │ 6. Save to temp files
     ▼
┌─────────────────┐
│  PDF Utils      │
│  extract_text   │
└────┬────────────┘
     │ 7. Extract text from each PDF
     │ 8. Return text strings
     ▼
┌─────────────────┐
│  Text Splitter  │
│  (LangChain)    │
└────┬────────────┘
     │ 9. Chunk text (1000 chars, 200 overlap)
     │ 10. Return chunks
     ▼
┌─────────────────┐
│  Vector Store   │
│  Utils          │
└────┬────────────┘
     │ 11. Get embeddings model
     │ 12. Create embeddings for chunks
     ▼
┌─────────────────┐
│  OpenAI API     │
│  (Embeddings)   │
└────┬────────────┘
     │ 13. Return 3072-dim vectors
     ▼
┌─────────────────┐
│  FAISS Index    │
└────┬────────────┘
     │ 14. Index vectors
     │ 15. Store in AppState
     ▼
┌─────────────────┐
│  FastAPI        │
│  Response       │
└────┬────────────┘
     │ 16. Return success response
     │     {status, message, chunks}
     ▼
┌─────────────────┐
│  Frontend       │
│  Display        │
└────┬────────────┘
     │ 17. Show success message
     ▼
┌──────────┐
│  User    │
└──────────┘
```

### 4.2 Chat Query Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Enter question
     ▼
┌─────────────────┐
│ ChatInterface   │
│ Component       │
└────┬────────────┘
     │ 2. Update state
     │ 3. Add user message to history
     ▼
┌─────────────────┐
│  API Service    │
│  (sendChat)     │
└────┬────────────┘
     │ 4. POST /chat (JSON)
     │    {message: "..."}
     ▼
┌─────────────────┐
│  FastAPI        │
│  /chat          │
└────┬────────────┘
     │ 5. Validate vectorstore exists
     │ 6. Initialize chat model (if needed)
     ▼
┌─────────────────┐
│  Vector Store   │
│  Utils          │
└────┬────────────┘
     │ 7. Embed query
     ▼
┌─────────────────┐
│  OpenAI API     │
│  (Embeddings)   │
└────┬────────────┘
     │ 8. Return query vector
     ▼
┌─────────────────┐
│  FAISS Index    │
└────┬────────────┘
     │ 9. Similarity search (k=4)
     │ 10. Return top 4 chunks
     ▼
┌─────────────────┐
│  FastAPI        │
│  /chat          │
└────┬────────────┘
     │ 11. Construct prompt
     │     - System instructions
     │     - Retrieved context
     │     - User question
     ▼
┌─────────────────┐
│  Chat Utils     │
│  ask_chat_model │
└────┬────────────┘
     │ 12. Send prompt to GPT-4o
     ▼
┌─────────────────┐
│  OpenAI API     │
│  (Chat)         │
└────┬────────────┘
     │ 13. Generate response
     │ 14. Return answer
     ▼
┌─────────────────┐
│  FastAPI        │
│  Response       │
└────┬────────────┘
     │ 15. Return {response: "..."}
     ▼
┌─────────────────┐
│  Frontend       │
│  Display        │
└────┬────────────┘
     │ 16. Add assistant message
     │ 17. Update chat history
     ▼
┌──────────┐
│  User    │
└──────────┘
```

### 4.3 Data Transformation Pipeline

```
PDF Document
    ↓
[Text Extraction]
    ↓
Raw Text String
    ↓
[Text Chunking]
    ↓
Text Chunks (1000 chars each)
    ↓
[Embedding Generation]
    ↓
Vector Embeddings (3072 dimensions)
    ↓
[FAISS Indexing]
    ↓
Searchable Vector Index
    ↓
[Query Embedding]
    ↓
Query Vector (3072 dimensions)
    ↓
[Similarity Search]
    ↓
Relevant Document Chunks
    ↓
[Context Assembly]
    ↓
Formatted Prompt
    ↓
[LLM Generation]
    ↓
Natural Language Response
```

---

## 5. API Specifications

### 5.1 Base Configuration

**Base URL**: `http://localhost:8000`  
**Protocol**: HTTP/HTTPS  
**Content Types**: `application/json`, `multipart/form-data`

### 5.2 Endpoints

#### 5.2.1 Health Check

**Endpoint**: `GET /`

**Description**: Verify API is running

**Request**: None

**Response**:
```json
{
  "message": "NaviOwl API is running"
}
```

**Status Codes**:
- `200 OK`: API is operational

---

#### 5.2.2 Upload Documents

**Endpoint**: `POST /upload`

**Description**: Upload and process PDF documents

**Request**:
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `files`: Array of PDF files (max 10)

**Example (cURL)**:
```bash
curl -X POST http://localhost:8000/upload \
  -F "files=@document1.pdf" \
  -F "files=@document2.pdf"
```

**Success Response** (`200 OK`):
```json
{
  "status": "success",
  "message": "Processed 2 documents",
  "chunks": 45
}
```

**Warning Response** (`200 OK`):
```json
{
  "status": "warning",
  "message": "No text extracted from documents"
}
```

**Error Response** (`500 Internal Server Error`):
```json
{
  "detail": "Error processing documents: <error_message>"
}
```

**Validation Rules**:
- File type must be PDF
- Maximum 10 files per request
- Maximum file size: 50MB per file

---

#### 5.2.3 Chat Query

**Endpoint**: `POST /chat`

**Description**: Query uploaded documents

**Request**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "message": "What are the key provisions in the CBA?"
}
```

**Example (cURL)**:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the key provisions?"}'
```

**Success Response** (`200 OK`):
```json
{
  "response": "Based on the documents, the key provisions include..."
}
```

**Error Response** (`400 Bad Request`):
```json
{
  "detail": "Please upload documents first"
}
```

**Error Response** (`500 Internal Server Error`):
```json
{
  "detail": "Failed to initialize chat model: Invalid API key"
}
```

**Validation Rules**:
- Message must not be empty
- Maximum message length: 500 characters
- Vectorstore must exist (documents uploaded)

---

### 5.3 Request/Response Models

#### UploadResponse
```python
class UploadResponse(BaseModel):
    status: str  # "success" or "warning"
    message: str
    chunks: Optional[int] = None
```

#### ChatRequest
```python
class ChatRequest(BaseModel):
    message: str
```

#### ChatResponse
```python
class ChatResponse(BaseModel):
    response: str
```

#### ErrorResponse
```python
class ErrorResponse(BaseModel):
    detail: str
```

---

## 6. Database Design

### 6.1 Vector Store (FAISS)

**Type**: In-memory vector database  
**Purpose**: Semantic similarity search

**Schema**:
```
Index Structure:
- Dimension: 3072 (text-embedding-3-large)
- Index Type: Flat (exact search)
- Distance Metric: Cosine similarity
```

**Data Storage**:
```python
{
    "vectors": np.ndarray,  # Shape: (n_chunks, 3072)
    "documents": List[Document],  # Original text chunks
    "metadata": List[Dict]  # Document metadata
}
```

**Operations**:
- **Insert**: Add new document vectors
- **Search**: Find k nearest neighbors
- **Clear**: Remove all vectors (session end)

### 6.2 Application State

**Type**: In-memory Python objects  
**Scope**: Per-application instance

**Structure**:
```python
class AppState:
    vectorstore: Optional[FAISS]
    chat_model: Optional[ChatOpenAI]
```

**Lifecycle**:
- **Initialization**: `None` values
- **Document Upload**: `vectorstore` populated
- **First Query**: `chat_model` initialized
- **Session End**: Garbage collected

### 6.3 Session Management

**Current Implementation**: Single-user, in-memory

**Future Enhancement**: Multi-user with session storage

**Proposed Schema** (Redis):
```json
{
  "session_id": "uuid-string",
  "user_id": "user-identifier",
  "vectorstore_key": "s3://bucket/session/vectorstore.faiss",
  "created_at": "2026-02-07T12:00:00Z",
  "expires_at": "2026-02-07T18:00:00Z",
  "document_count": 3,
  "query_count": 15
}
```

---

## 7. Security Architecture

### 7.1 Security Layers

```
┌─────────────────────────────────────────┐
│         Transport Security              │
│  • HTTPS (Production)                   │
│  • TLS 1.2+                             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Application Security            │
│  • CORS Protection                      │
│  • Input Validation                     │
│  • File Type Validation                 │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         API Security                    │
│  • API Key Management                   │
│  • Environment Variables                │
│  • No Hardcoded Secrets                 │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Data Security                   │
│  • In-Memory Processing                 │
│  • No Persistent Storage                │
│  • Automatic Cleanup                    │
└─────────────────────────────────────────┘
```

### 7.2 CORS Configuration

**Implementation**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Configuration**:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Security Considerations**:
- Restrict origins in production
- Avoid wildcard (`*`) in production
- Use HTTPS origins only

### 7.3 Input Validation

**File Upload Validation**:
```python
# File type validation
if not file.filename.endswith('.pdf'):
    raise HTTPException(400, "Only PDF files allowed")

# File size validation (50MB limit)
if file.size > 50 * 1024 * 1024:
    raise HTTPException(400, "File too large")
```

**Query Validation**:
```python
# Message length validation
if len(request.message) > 500:
    raise HTTPException(400, "Message too long")

# Empty message validation
if not request.message.strip():
    raise HTTPException(400, "Message cannot be empty")
```

### 7.4 API Key Management

**Storage**: Environment variables (`.env` file)

**Access**:
```python
def get_openai_api_key() -> Optional[str]:
    return os.getenv("OPENAI_API_KEY")
```

**Best Practices**:
- Never commit `.env` to version control
- Use secrets management in production (AWS Secrets Manager, HashiCorp Vault)
- Rotate keys regularly
- Monitor API usage for anomalies

### 7.5 Data Privacy

**Principles**:
1. **No Persistent Storage**: Documents processed in-memory only
2. **Session Isolation**: Each user has independent state
3. **Automatic Cleanup**: Resources freed on session end
4. **No Logging**: Document content not logged

**Implementation**:
```python
# Temporary file cleanup
try:
    text = extract_text_from_pdf(tmp_path)
finally:
    os.unlink(tmp_path)  # Always delete temp file
```

---

## 8. Deployment Architecture

### 8.1 Development Environment

```
┌─────────────────────────────────────────┐
│         Developer Machine               │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Frontend (Vite Dev Server)       │  │
│  │  Port: 5173                       │  │
│  │  Hot Module Replacement           │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Backend (Uvicorn)                │  │
│  │  Port: 8000                       │  │
│  │  Auto-reload enabled              │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Environment: .env file                 │
└─────────────────────────────────────────┘
```

**Startup Script**: `run_app.sh`
```bash
#!/bin/bash
# Start backend
cd backend && uvicorn main:app --reload &

# Start frontend
cd frontend && npm run dev &
```

### 8.2 Production Deployment

#### 8.2.1 Docker Deployment

**Backend Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

**Docker Compose**:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ALLOWED_ORIGINS=https://yourdomain.com
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### 8.2.2 Cloud Deployment (AWS)

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Cloud                            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Route 53 (DNS)                                   │  │
│  │  naviowl.example.com                            │  │
│  └─────────────────┬─────────────────────────────────┘  │
│                    │                                    │
│  ┌─────────────────▼─────────────────────────────────┐  │
│  │  CloudFront (CDN)                                 │  │
│  │  • SSL/TLS Termination                            │  │
│  │  • Static Asset Caching                           │  │
│  └─────────────────┬─────────────────────────────────┘  │
│                    │                                    │
│         ┌──────────┴──────────┐                         │
│         │                     │                         │
│  ┌──────▼──────┐      ┌──────▼──────┐                  │
│  │  S3 Bucket  │      │     ALB     │                  │
│  │  (Frontend) │      │ (Load Bal.) │                  │
│  └─────────────┘      └──────┬──────┘                  │
│                              │                          │
│                    ┌─────────┴─────────┐                │
│                    │                   │                │
│            ┌───────▼──────┐    ┌──────▼───────┐        │
│            │   ECS Task   │    │  ECS Task    │        │
│            │  (Backend 1) │    │ (Backend 2)  │        │
│            │              │    │              │        │
│            │  FastAPI     │    │  FastAPI     │        │
│            │  Container   │    │  Container   │        │
│            └──────────────┘    └──────────────┘        │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Secrets Manager                                  │  │
│  │  • OPENAI_API_KEY                                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  CloudWatch                                       │  │
│  │  • Logs                                           │  │
│  │  • Metrics                                        │  │
│  │  • Alarms                                         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- **Route 53**: DNS management
- **CloudFront**: CDN for frontend assets
- **S3**: Static file hosting (frontend build)
- **ALB**: Application Load Balancer
- **ECS**: Container orchestration (backend)
- **Secrets Manager**: Secure API key storage
- **CloudWatch**: Monitoring and logging

### 8.3 Scaling Strategy

#### Horizontal Scaling
```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ┌───┴────┬────────┬────────┐
   ↓        ↓        ↓        ↓
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│API 1│  │API 2│  │API 3│  │API N│
└─────┘  └─────┘  └─────┘  └─────┘
```

**Auto-scaling Rules**:
- Scale up: CPU > 70% for 5 minutes
- Scale down: CPU < 30% for 10 minutes
- Min instances: 2
- Max instances: 10

#### Vertical Scaling
- **Development**: 2 CPU, 4GB RAM
- **Production**: 4 CPU, 16GB RAM
- **High Load**: 8 CPU, 32GB RAM

---

## 9. Performance Considerations

### 9.1 Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Document Processing (100 pages) | < 30s | ~25s |
| Query Response Time (p95) | < 5s | ~3s |
| Concurrent Users | 100+ | 50 |
| Memory per Session | < 2GB | ~1.5GB |

### 9.2 Optimization Strategies

#### 9.2.1 Frontend Optimization
- **Code Splitting**: Lazy load components
- **Asset Optimization**: Minify CSS/JS
- **Caching**: Service worker for offline support
- **CDN**: Serve static assets from CDN

#### 9.2.2 Backend Optimization
- **Async Processing**: FastAPI async endpoints
- **Connection Pooling**: Reuse HTTP connections
- **Caching**: Cache embeddings model
- **Batch Processing**: Group embedding requests

#### 9.2.3 AI/ML Optimization
- **Model Selection**: Use GPT-4o-mini for simple queries
- **Embedding Cache**: Reuse embeddings for identical chunks
- **Index Optimization**: Use FAISS IVF index for large datasets
- **Prompt Optimization**: Reduce token usage

### 9.3 Monitoring

**Metrics to Track**:
- Request latency (p50, p95, p99)
- Error rate
- CPU/Memory usage
- API call count (OpenAI)
- Document processing time
- Vector search latency

**Tools**:
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **CloudWatch**: AWS monitoring
- **Sentry**: Error tracking

---

## 10. Appendix

### 10.1 Technology Versions

**Frontend**:
- React: 19.2.0
- Vite: 7.2.4
- Axios: 1.13.2
- Framer Motion: 12.24.12

**Backend**:
- Python: 3.9+
- FastAPI: 0.100+
- Uvicorn: 0.20+
- LangChain: Latest
- FAISS: 1.7.4+
- PyPDF: 3.0+

**AI Models**:
- GPT-4o: Latest
- text-embedding-3-large: Latest

### 10.2 File Structure

```
NaviOwl-V2/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── pdf_utils.py
│   │   ├── vectorstore_utils.py
│   │   └── chat_utils.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── public/
│   │   └── logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx
│   │   │   └── UploadArea.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── api.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── run_app.sh
├── README.md
├── PRD.md
└── HLD.md
```

### 10.3 Environment Variables

```env
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 10.4 API Documentation

**Swagger UI**: http://localhost:8000/docs  
**ReDoc**: http://localhost:8000/redoc

---

**Document Version**: 1.0  
**Last Updated**: February 7, 2026  
**Status**: Active Development  
**Next Review**: March 7, 2026

---

**End of Document**
