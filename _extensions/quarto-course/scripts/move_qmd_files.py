import os
import shutil

input_files = os.getenv("QUARTO_PROJECT_INPUT_FILES")


# loop over all paths in the input_files variable, splitting on newlines:

for path in input_files.split("\n"):
    new_path = "docs/" + path
    try:
    # append docs/ to the front of the path:
    #copy the file from the original path to the new path
        os.makedirs(os.path.dirname(new_path), exist_ok=True)
        shutil.copy(path, new_path)
        print(f"copied {path} to {new_path}")
    except Exception as e:
        print(f"Failed to copy {path} to {new_path}. Error: {e}")