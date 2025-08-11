# inference.py
import sys
import traceback
from langchain_ollama import OllamaLLM
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores.faiss import FAISS
from langchain.chains import RetrievalQA

# --- Model and Retriever Setup ---
try:
    llm = OllamaLLM(model="llama2")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = FAISS.load_local("vectorstore", embeddings, allow_dangerous_deserialization=True)
    retriever = vectorstore.as_retriever()
except Exception as e:
    # This error will be printed to stderr if the script is run from the command line
    print(f"FATAL: FAISS/vectorstore missing or failed to load. Install with `pip install faiss-cpu` in your venv and ensure 'vectorstore' directory exists. Details: {e}", file=sys.stderr)
    sys.exit(1)


# --- Core Logic ---
def ask(prompt: str) -> str:
    """
    Takes a user prompt, adds a specific instruction for the LLM,
    and returns the resulting code from the QA chain.
    """
    instruction = "Return only the Python code for the body of the construct method, no explanation or markdown.\n"
    
    # Set up the QA chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=False, # We only need the final answer
    )

    # Invoke the chain with the combined instruction and prompt
    response = qa_chain.invoke({"query": instruction + prompt})
    
    # Return the clean result string
    return response["result"].strip()


# --- Script Execution Block ---
def main():
    """
    Main function to handle command-line execution.
    Reads a prompt from system arguments, calls ask(), and prints the output.
    """
    # The first argument is the script name, the rest is the prompt.
    if len(sys.argv) > 1:
        # Join all arguments after the script name to form the prompt
        prompt = " ".join(sys.argv[1:])
    else:
        # If no prompt is provided via arguments, exit with an error.
        print("Error: No prompt provided.", file=sys.stderr)
        sys.exit(1)

    try:
        # Get the code from the language model
        output_code = ask(prompt)
        # Print the final result to stdout so the Node.js server can capture it
        print(output_code)
    except Exception as e:
        # If any error occurs during the 'ask' process, print it to stderr
        print(f"An error occurred in inference.py: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

# This makes the script runnable from the command line
if __name__ == "__main__":
    main()
