To get started:

1. Put your own CSV in the `data` folder, with at the minimum `to` and `subject` columns.
    1. You can also add `cc` and `bcc` columns (to use them you will need to pass the correct CLI option though)
    2. `to`, `cc`, and `bcc` can be a space-separated list of emails.
    3. You can add any other columns you like, and they will be available in the template.
    4. For attachments, add a column with the name `attachment` with a singular path to the file to attach relative to th workspace root (e.g. `./attachments/image1.jpg`).
        1. Or, pass the same attachment to every email using the `-a` flag to `generate`
    5. For multiple attachments, have separate columns e.g. `attachment1`, `attachment2`, etc.
    6. See `data/example.csv` for an example.
2. Put your own nunjucks markdown email template in the `templates` folder.
    1. You can also edit the default `wrapper.html.njk` file - this is what the markdown HTML will be wrapped in when sending it. It msut _always_ include a `{{ content }}` tag, which will be replaced with the markdown HTML.
3. Fill in the `.env` file with your email credentials.

Then run the following commands:

```bash
docsoc-mailmerge generate nunjucks ./data/my-data.csv ./templates/my-template.md.njk -o ./output --htmlTemplate ./templates/wrapper.html.njk
# make some edits to the outputs and regenerate them:
docsoc-mailmerge regenerate ./output/<runname>
# review them, then send:
docsoc-mailmerge send ./output/<runname>
```

The CLI tool has many options - use `--help` to see them all:

```bash
docsoc-mailmerge generate nunjucks --help
docsoc-mailmerge regenerate --help
docsoc-mailmerge send --help
```
