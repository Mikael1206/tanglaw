from langchain_community.document_loaders import PyPDFDirectoryLoader
try:
    loader = PyPDFDirectoryLoader("backend/ai-service/data/")
    docs = loader.load()
    print(f"Loaded {len(docs)} documents.")
except Exception as e:
    print(f"Error: {e}")
