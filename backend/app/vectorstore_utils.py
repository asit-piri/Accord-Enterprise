from langchain_community.vectorstores import FAISS
from typing import List
import logging
from langchain_openai import OpenAIEmbeddings
from app.config import get_openai_api_key

logger = logging.getLogger(__name__)

# Global cache for embeddings
_embeddings_cache = None


def get_embeddings():
    """Lazy load and cache OpenAI embeddings model."""
    global _embeddings_cache
    if _embeddings_cache is None:
        try:
            api_key = get_openai_api_key()
            if not api_key:
                logger.warning("OPENAI_API_KEY not set; embeddings may not work")

            _embeddings_cache = OpenAIEmbeddings(
                api_key=api_key, model="text-embedding-3-large"
            )
        except Exception as e:
            logger.exception("Could not initialize OpenAI embeddings: %s", e)
            return None
    return _embeddings_cache


def create_faiss_index(texts: List[str]):
    """Create a FAISS vector store from text chunks.
    
    Args:
        texts: List of text chunks to embed and index.
        
    Returns:
        FAISS vector store instance.
    """
    embeddings = get_embeddings()
    if embeddings is None:
        raise RuntimeError("Could not initialize embeddings model")
    return FAISS.from_texts(texts, embeddings)


def retrieve_relevant_docs(vectorstore: FAISS, query: str, k: int = 4):
    """Retrieve relevant documents from vector store.
    
    Args:
        vectorstore: FAISS vector store instance.
        query: Search query string.
        k: Number of documents to retrieve (default: 4).
        
    Returns:
        List of relevant documents.
    """
    return vectorstore.similarity_search(query, k=k)
