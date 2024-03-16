import os
import subprocess
import yaml
import shutil
import glob
from git import Repo
from git import InvalidGitRepositoryError

with open('_config.yml', 'r') as file:
  config = yaml.safe_load(file)

# Read the OUTPUT_DIR from the config
OUTPUT_DIR = config.get('OUTPUT_DIR', '_site')  # Use '_site' as default if 'OUTPUT_DIR' is not found

if config['MAKE_WEBSITE_DIR']:
  if config['DO_GITHUB']:
    def get_unique_name(base_name):
        counter = 1
        while os.path.exists(f"{base_name}.archive({counter})"):
            counter += 1
        return f"{base_name}.archive({counter})"

    if os.path.isdir(config['WEBSITE_DIR']):
        try:
            repo = Repo(config['WEBSITE_DIR'])
        except InvalidGitRepositoryError:
            new_name = get_unique_name(config['WEBSITE_DIR'])
            print(config['WEBSITE_DIR']+" is not a git repository. Archiving it as "+new_name)
            os.rename(config['WEBSITE_DIR'], new_name)
            repo = Repo.clone_from(config['ORIGIN'], config['WEBSITE_DIR'])
        except Exception as e:
            print(f"An error occurred: {e}")
    else:
        repo = Repo.clone_from(config['ORIGIN'], config['WEBSITE_DIR'])

    # Copy '_site/*_files' to 'website/.'
    for file in glob.glob(f'{OUTPUT_DIR}/*_files'):
        dst = os.path.join('website', os.path.basename(file))
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(file, dst)

    # Copy '_site/site_libs' to 'website/.'
    dst = 'website/site_libs'
    if os.path.exists(f'{OUTPUT_DIR}/site_libs'):
      if os.path.exists(dst):
          shutil.rmtree(dst)
      shutil.copytree(f'{OUTPUT_DIR}/site_libs', dst)

    # Copy '_site/*.html' to 'website/.'
    for file in glob.glob(f'{OUTPUT_DIR}/*.html'):
        shutil.copy(file, 'website/')

    # remove the output directory if the variable REMOVE_OUTPUT_DIR is set to true
    if config['REMOVE_OUTPUT_DIR']:
        shutil.rmtree(OUTPUT_DIR)


  # Remove '*.html' files
  for file in glob.glob('*.html'):
      os.remove(file)

