#git -C website pull || git clone git@github.com:KBurbank/stat24320.git website

DIR=website && ORIGIN=git@github.com:KBurbank/stat24320.git && \
  (test -d $DIR && git -C $DIR pull --rebase) || git clone --filter=tree:0 $ORIGIN $DIR
cp -R _site/*_files website/.
cp -R _site/site_libs website/.
cp _site/*.html website/.
rm *.html
git -C website add .
git -C website commit -am "automatically committed render output"
git -C website push
