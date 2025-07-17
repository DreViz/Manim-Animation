from langchain_ollama import OllamaLLM
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA

llm = OllamaLLM(model="llama2")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore = FAISS.load_local("vectorstore", embeddings, allow_dangerous_deserialization=True)
retriever = vectorstore.as_retriever()
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=True
)

def ask(prompt: str) -> str:
    instruction = "Return only the Python code for the body of the construct method, no explanation or markdown.\n"
    result = qa_chain.invoke({"query": instruction + prompt})
    return result["result"].strip()