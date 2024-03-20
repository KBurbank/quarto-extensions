import yaml
from git import Repo


try:
  with open('_quarto.yml', 'r') as file:
    config = yaml.safe_load(file)
except FileNotFoundError:
  print("'_quarto.yml' file not found. Exiting the update_git script.")



try:
  if config['custom']['do_git']:
    repo = Repo('.')
    repo.git.add('.')
    changes = repo.index.diff(repo.head.commit)
    if changes:
      print(repo.git.commit('-am', "automatically committed render output"))
      print(repo.git.push())
    else:
      print("No changes to commit")
  else:
    print('Not set in config')
except KeyError:
  print("Error: 'do_git' key not found in config")
