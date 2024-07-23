import Mailer from './mailer/mailer';
import createLogger from './util/logger';

import { promises as fs } from 'fs';
import nunjucks from 'nunjucks';
import markdownit from 'markdown-it';

import 'dotenv/config'; // load .env
import { join } from "path";

const logger = createLogger('docsoc');


async function main() {
	logger.info('Starting DoCSoc Mail Merge');
	logger.info("Loading template...")
	const template = await fs.readFile(join(__dirname, '../templates/TEMPLATE.md.njk'), 'utf-8');

	// read the params from the nunjucks template

	const templateCompiled = nunjucks.compile(template);
	const expanded = templateCompiled.render({ name: 'Kishan' });

	console.log(expanded);

	const md = markdownit({
		html: true,
		linkify: true,
		typographer: false,
		breaks: true,
	})

	const html = `<html><body>${md.render(expanded)}</body></html>`
	console.log(html);

  const mailer = new Mailer(
    process.env['DOCSOC_SMTP_SERVER'] ?? 'smtp-mail.outlook.com',
    587,
    process.env['DOCSOC_SMTP_USERNAME'] ?? 'docsoc@ic.ac.uk',
    process.env['DOCSOC_SMTP_PASSWORD'] ?? 'password'
  );

  await mailer.sendMail(
    Mailer.makeFromLineFromEmail(
      process.env['DOCSOC_SENDER_NAME'] ?? 'DoCSoc',
      Mailer.validateEmail(process.env['DOCSOC_SENDER_EMAIL'])
        ? process.env['DOCSOC_SENDER_EMAIL'] ?? 'docsoc@ic.ac.uk'
        : 'docsoc@ic.ac.uk'
    ),
    ['kss22@ic.ac.uk'],
    'Test email',
    html,
  );
}

main();
