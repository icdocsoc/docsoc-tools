docsoc-mailmerge generate nunjucks ./data/names.csv -o ./output -n test -b -c
docsoc-mailmerge regenerate ./output/test
docsoc-mailmerge upload-drafts ./output/test
docsoc-mailmerge send ./output/test