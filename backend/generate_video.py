import subprocess
import os
import re
import sys
import ast
import traceback
from datetime import datetime
from inference import ask

# Directory of this script
script_dir = os.path.dirname(__file__)

def extract_code_block(text: str) -> str:
    """
    Extract the first triple-backtick code block or return text as-is.
    Handles fenced code blocks with or without language specifiers.
    """
    m = re.search(r"```(?:python)?\s*([\s\S]*?)```", text)
    if m:
        return m.group(1).strip()
    return text.strip()

def write_manim_script(code: str, script_filename: str):
    """
    Writes the code inside the construct() method of AIAnimation class,
    indenting properly for Python syntax.
    """
    indented_code = "\n".join(("        " + line) if line.strip() else "" for line in code.splitlines())
    script = f"""
from manim import *

class AIAnimation(Scene):
    def construct(self):
{indented_code}
"""
    with open(script_filename, "w", encoding="utf-8") as f:
        f.write(script)

def extract_construct_body(code: str) -> str:
    """
    Extract just the body of construct() if it exists.
    Otherwise returns code as is.
    """
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) and node.name == "construct":
                lines = [ast.get_source_segment(code, stmt) for stmt in node.body]
                return "\n".join(l for l in lines if l)
    except Exception:
        pass
    return code

def generate_video(prompt: str):
    media_dir = os.path.join(script_dir, "media")
    os.makedirs(media_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    script_filename = f"ai_scene_{timestamp}.py"
    output_filename = f"output_{timestamp}.mp4"

    print("[generate_video] Using Python:", sys.executable)
    print("[generate_video] Output filename:", output_filename)

    # Get raw code from language model
    result = ask(prompt)
    code_inside_construct = extract_code_block(result)
    code_inside_construct = extract_construct_body(code_inside_construct)

    # Remove any stray markdown fences (triple backticks) and whitespace
    code_inside_construct = re.sub(r"```+", "", code_inside_construct).strip()

    print("[generate_video] Generated Manim code inside construct():")
    print(code_inside_construct)
    print("[generate_video] End of generated code\n")

    # Write the generated python scene script
    write_manim_script(code_inside_construct, script_filename)

    try:
        # Run Manim as a module to ensure correct environment usage
        cmd = [
            sys.executable, "-m", "manim",
            "-ql",  # Low quality video output
            script_filename,
            "AIAnimation",
            "--media_dir", media_dir,
            "--output_file", output_filename
        ]
        print("[generate_video] Running command:", " ".join(cmd))
        completed = subprocess.run(cmd, check=True, capture_output=True, text=True, cwd=script_dir)

        print("--- MANIM STDOUT ---")
        print(completed.stdout)
        print("--- MANIM STDERR ---")
        print(completed.stderr)

        # Recursively find the generated video file
        generated_video_path = None
        for root, dirs, files in os.walk(media_dir):
            if output_filename in files:
                generated_video_path = os.path.join(root, output_filename)
                break

        if generated_video_path and os.path.exists(generated_video_path):
            final_path = os.path.join(script_dir, output_filename)
            os.replace(generated_video_path, final_path)
            print(f"Video generated and moved to: {final_path}")
        else:
            print("[generate_video] ERROR: Video file not found after Manim run.")

    except subprocess.CalledProcessError as e:
        print("[generate_video] Manim error encountered:\n", e.stdout, "\n", e.stderr)
        traceback.print_exc()
    except Exception as e:
        print("[generate_video] Unexpected error:", e)
        traceback.print_exc()
    finally:
        if os.path.exists(script_filename):
            os.remove(script_filename)

if __name__ == "__main__":
    print("[generate_video] Script started.")
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
    else:
        prompt = input("Enter your animation prompt: ")
    generate_video(prompt)
