from langchain_ollama import OllamaLLM
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores.faiss import FAISS

llm = OllamaLLM(model="llama2")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

try:
    vectorstore = FAISS.load_local("vectorstore", embeddings, allow_dangerous_deserialization=True)
    retriever = vectorstore.as_retriever()
except Exception as e:
    raise RuntimeError(
        "FAISS/vectorstore missing or FAISS not installed. "
        "Install with `pip install faiss-cpu` in your venv and ensure 'vectorstore' exists."
    ) from e

def ask(prompt: str) -> str:
    instruction = "Return only the Python code for the body of the construct method, no explanation or markdown.\n"
    result = retriever.vectorstore.similarity_search  # not used directly here but retriever is set
    # If you really want RetrievalQA as before:
    from langchain.chains import RetrievalQA
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=True
    )
    out = qa_chain.invoke({"query": instruction + prompt})
    return out["result"].strip()
