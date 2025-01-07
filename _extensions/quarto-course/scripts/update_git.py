import yaml
import os

import sys
print(sys.path)
print(sys.executable)


from git import Repo

#if not os.getenv("QUARTO_PROJECT_RENDER_ALL"):
 # exit()

try:
  with open('_quarto.yml', 'r') as file:
    config = yaml.safe_load(file)
except FileNotFoundError:
  print("'_quarto.yml' file not found. Exiting the update_git script.")

def doUpdate(repo):
    repo.git.add('.')
    changes = repo.index.diff(repo.head.commit)
    if changes:
      print(repo.git.commit('-am', "automatically committed render output"))
      print(repo.git.push())
    else:
      print("No changes to commit in path" + repo.working_dir)

try:
  if config['custom']['do_git']:
    repo = Repo('.')
    doUpdate(repo)
    for submodule in repo.submodules:
      doUpdate(submodule.module())
  else:
    print('Not set in config')
except KeyError:
  print("Error: 'do_git' or 'git_dirs' key not found in config")
