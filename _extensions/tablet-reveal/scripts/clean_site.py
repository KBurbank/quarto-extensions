import os
import shutil
import fnmatch

# set a variable that is the output directory to be equal to "site_tmp"

site_dir = os.getenv("QUARTO_PROJECT_OUTPUT_DIR")
quarto_project_dir = os.getenv("QUARTO_PROJECT_DIR")
if not site_dir or site_dir == quarto_project_dir or not quarto_project_dir:
    exit()


# within site_dir, remove any folders or files that begin with "_"
# List all directories and files in site_dir
for name in os.listdir(site_dir):
    if name.startswith("_"):
        # Construct full directory or file path
        path = os.path.join(site_dir, name)
        # Remove directory or file
        if os.path.isdir(path):
            shutil.rmtree(path)
        elif os.path.isfile(path):
            os.remove(path)

# remove any files within site_dir which end in .qmd
for root, dirs, files in os.walk(site_dir):
    for file in files:
        if file.endswith(".qmd"):
            os.remove(os.path.join(root, file))
            
# remove any empty directories within site_dir
for root, dirs, files in os.walk(site_dir, topdown=False):
    for name in dirs:
        dir_path = os.path.join(root, name)
        if not os.listdir(dir_path):
            os.rmdir(dir_path)
            
# remove anything from site_dir that would be found by .gitignore
# Read .gitignore file
with open('.gitignore', 'r') as f:
    gitignore_patterns = f.read().splitlines()

# Remove any files within site_dir that would be found by .gitignore
for root, dirs, files in os.walk(site_dir):
    for pattern in gitignore_patterns:
        for filename in fnmatch.filter(files, pattern):
            os.remove(os.path.join(root, filename))
            
# Remove any files within quarto_project_dir which end in "-speaker.html", however do not remove any files which are in site_dir
for root, dirs, files in os.walk(quarto_project_dir):
    for file in files:
        if file.endswith("-speaker.html"):
            file_path = os.path.join(root, file)
            # Check if the file is not in site_dir
            if site_dir not in file_path:
                os.remove(file_path)