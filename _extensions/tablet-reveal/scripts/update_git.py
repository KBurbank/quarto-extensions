import yaml
from git import Repo


with open('_quarto.yml', 'r') as file:
  config = yaml.safe_load(file)


if config['kendra']['do_git']:
    repo = Repo('.')
    repo.git.add('.')
    changes = repo.index.diff(repo.head.commit)
    if changes:
       print(repo.git.commit('-am', "automatically committed render output"))
       print(repo.git.push())
    else:
        print("No changes to commit")