import os
import shutil
import fnmatch

# set a variable that is the output directory to be equal to "site_tmp"

site_dir = os.getenv("QUARTO_PROJECT_OUTPUT_DIR")

print(site_dir)
print(os.getenv("QUARTO_PROJECT_OUTPUT_FILES"))
print(os.getenv("QUARTO_PROJECT_DIR"))
quarto_project_dir = os.getenv("QUARTO_PROJECT_DIR")

if not site_dir or site_dir == quarto_project_dir or not quarto_project_dir:
    exit()
