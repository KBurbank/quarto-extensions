import yaml
from git import Repo


with open('_config.yml', 'r') as file:
  config = yaml.safe_load(file)


if config['DO_GITHUB']:
    repo = Repo('website')
    repo.git.add('.')
    changes = repo.index.diff(repo.head.commit)
    if changes:
       print(repo.git.commit('-am', "automatically committed render output"))
       print(repo.git.push())
    else:
        print("No changes to commit")