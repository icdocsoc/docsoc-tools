docsoc-mailmerge generate nunjucks ./data/names3.csv -o ./output -n test -b -c
docsoc-mailmerge regenerate ./output/test
docsoc-mailmerge upload-drafts ./output/test -y -s 2
docsoc-mailmerge send ./output/test -s 5