import Mailer from './mailer/mailer';
import createLogger from './util/logger';

import { promises as fs } from 'fs';
import nunjucks from 'nunjucks';
import markdownit from 'markdown-it';

import 'dotenv/config'; // load .env
import { join } from "path";
import { renderMarkdownTemplate, renderMarkdownToHtml } from "./markdown/template";
import { parse } from "csv-parse";
import { defaultMailer, getDefaultMailer } from "./mailer/defaultMailer";

const logger = createLogger('docsoc');


async function main() {
	logger.info('Starting DoCSoc Mail Merge');
	logger.info("Loading template...")
	const template = await fs.readFile(join(__dirname, '../templates/TEMPLATE.md.njk'), 'utf-8');
	const csv = await fs.readFile(join(__dirname, '../data/names.csv'), 'utf-8');
	const templateCompiled = nunjucks.compile(template);
	const mailer = getDefaultMailer();
	// read the params from the nunjucks template

	const csvData = parse(csv, {columns: true});
	for await (const record of csvData) {
		
		const expanded = renderMarkdownTemplate(templateCompiled, {
			name: record["name"]
		})
		const html = renderMarkdownToHtml(expanded);


		await defaultMailer([record["email"]], "DoCSoc Mail Merge Test", html, mailer);
	}

}

main();
