from langchain_ollama import OllamaLLM
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA

# Load LLM
llm = OllamaLLM(model="llama2")

# Load embeddings from Hugging Face
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Load the prebuilt FAISS vectorstore
vectorstore = FAISS.load_local("vectorstore", embeddings, allow_dangerous_deserialization=True)

# Setup retriever
retriever = vectorstore.as_retriever()

# Setup Retrieval QA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=True
)

# Query function
def ask(prompt):
    result = qa_chain.invoke({"query": prompt})
    print("\n🎬 Generated Code:\n")
    print(result["result"])

# CLI entrypoint
if __name__ == "__main__":
    while True:
        query = input("\nPrompt: ")  # Removed emoji for Windows compatibility
        if query.lower() in ["exit", "quit"]:
            break
        ask(query)
