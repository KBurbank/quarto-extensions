import os
import subprocess

# read in and execute the _config file
import yaml
import shutil
import glob


from git import Repo
from git import InvalidGitRepositoryError




with open('_config.yml', 'r') as file:
  config = yaml.safe_load(file)

# Now you can access the values in the YAML file through the config dictionary
# For example, to get the value of a key named 'key_name', you would use config['key_name']



import os
import shutil
from git import Repo, InvalidGitRepositoryError



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
  for file in glob.glob('_site/*_files'):
      dst = os.path.join('website', os.path.basename(file))
      if os.path.exists(dst):
          shutil.rmtree(dst)
      shutil.copytree(file, dst)

  # Copy '_site/site_libs' to 'website/.'
  dst = 'website/site_libs'
  if os.path.exists('_site/site_libs'):
    if os.path.exists(dst):
        shutil.rmtree(dst)
    shutil.copytree('_site/site_libs', dst)

  # Copy '_site/*.html' to 'website/.'
  for file in glob.glob('_site/*.html'):
      shutil.copy(file, 'website/')

  # Remove '*.html' files
  for file in glob.glob('*.html'):
      os.remove(file)



  if config['DO_GITHUB']:
    repo = Repo('website')
    repo.git.add('.')
    changes = repo.index.diff(repo.head.commit)
    if changes:
       print('here')
       print(repo.git.commit('-am', "automatically committed render output"))
       print(repo.git.push())
    else:
        print("No changes to commit")