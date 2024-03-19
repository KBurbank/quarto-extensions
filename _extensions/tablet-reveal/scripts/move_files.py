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



    # Copy '_site/*_files' to 'website/.'
    for file in glob.glob(f'{OUTPUT_DIR}/*_files'):
        dst = os.path.join(config['WEBSITE_DIR'], os.path.basename(file))
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(file, dst)

    # Copy '_site/site_libs' to 'website/.'
    dst = config['WEBSITE_DIR']+'/site_libs'
    if os.path.exists(f'{OUTPUT_DIR}/site_libs'):
      if os.path.exists(dst):
          shutil.rmtree(dst)
      shutil.copytree(f'{OUTPUT_DIR}/site_libs', dst)

    # Copy '_site/*.html' to 'website/.'
    for file in glob.glob(f'{OUTPUT_DIR}/*.html'):
        shutil.copy(file, config['WEBSITE_DIR'])
        
    # Copy lectures to outputdir, as a directory
    shutil.copytree('lectures', config['WEBSITE_DIR']+'/lectures')
        

    # remove the output directory if the variable REMOVE_OUTPUT_DIR is set to true
    if config['REMOVE_OUTPUT_DIR']:
        shutil.rmtree(OUTPUT_DIR)


  # Remove '*.html' files
  for file in glob.glob('*.html'):
      os.remove(file)

