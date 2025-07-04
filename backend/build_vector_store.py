from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

def main():
    # Load snippets.txt only
    snippet_path = "snippets.txt"
    loader = TextLoader(snippet_path, encoding="utf-8")
    docs = loader.load()

    # Tag each document with metadata for source
    for doc in docs:
        doc.metadata["source"] = "snippets"

    # Split documents into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    split_docs = splitter.split_documents(docs)

    # Generate embeddings and save vectorstore
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(split_docs, embeddings)
    vectorstore.save_local("vectorstore")

if __name__ == "__main__":
    main()
