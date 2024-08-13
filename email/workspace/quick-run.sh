docsoc-mailmerge generate nunjucks ./data/names.csv -o ./output -n test -b -c
docsoc-mailmerge regenerate ./output/test
# docsoc-mailmerge upload-drafts ./output/test -y -s 2 -n 1
docsoc-mailmerge send ./output/test -s 5 -n 2 -t "kss22@ic.ac.uk"