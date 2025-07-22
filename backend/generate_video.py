import subprocess
import os
from inference import ask
import re
from datetime import datetime
import traceback
import sys

def extract_code_block(text: str) -> str:
    """
    Extract the first Python code block from markdown text.
    """
    code_blocks = re.findall(r"```(?:python)?\s*([\s\S]*?)```", text)
    if code_blocks:
        return code_blocks[0].strip()
    return text.strip()  # faasdasdasdallback: return everything

def is_valid_manim_code(code: str) -> bool:
    # Simple check: must contain at least one likely code line
    keywords = ["self.play", "self.wait", "=", "Circle", "Square", "Line", "Create", "FadeIn", "FadeOut"]
    return any(k in code for k in keywords)

def write_manim_script(code: str, script_filename: str):
    # Indent each line by 8 spaces for correct Python indentation
    indented_code = "\n".join("        " + line if line.strip() else "" for line in code.splitlines())
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
    Extract the body of the construct method from a class or function definition.
    If not found, return the original code.
    """
    import ast
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) and node.name == "construct":
                lines = [ast.get_source_segment(code, stmt) for stmt in node.body]
                return "\n".join(lines)
    except Exception as e:
        pass
    return code

def generate_video(prompt):
    output_dir = "media/videos"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    script_filename = f"ai_scene_{timestamp}.py"
    output_filename = f"output_{timestamp}.mp4"

    result = ask(prompt)
    code_inside_construct = extract_code_block(result)
    code_inside_construct = extract_construct_body(code_inside_construct)

    if not is_valid_manim_code(code_inside_construct):
        print("Error: LLM did not return valid Manim code.")
        return

    write_manim_script(code_inside_construct, script_filename)

    try:
        subprocess.run([
            "manim", 
            "-pql",
            script_filename,
            "AIAnimation",
            "--output_file", output_filename
        ], check=True)
        src = f"media/videos/ai_scene/{timestamp}/480p15/{output_filename}"
        if os.path.exists(src):
            os.rename(src, output_filename)
        print(f"Video generated: {output_filename}")
    except subprocess.CalledProcessError as e:
        print("Error running Manim:", e)
        traceback.print_exc()
    except Exception as e:
        print("Unexpected error:", e)
        traceback.print_exc()
    finally:
        if os.path.exists(script_filename):
            os.remove(script_filename)

if __name__ == "__main__":
    print("[generate_video] Script started.")
    if len(sys.argv) > 1:
        print("[generate_video] Arguments provided:", sys.argv[1:])
        prompt = " ".join(sys.argv[1:])
    else:
        print("[generate_video] No arguments provided.")
        print('For best results, describe your animation. The system will prepend:\n'
              '"Return only the Python code for the body of the construct method, no explanation or markdown."')
        prompt = input("Enter your animation prompt: ")
    generate_video(prompt)
