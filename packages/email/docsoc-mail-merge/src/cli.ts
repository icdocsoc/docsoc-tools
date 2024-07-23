import Mailer from './mailer/mailer';
import createLogger from './util/logger';

import 'dotenv/config'; // load .env

const logger = createLogger('docsoc');

async function main() {
  const mailer = new Mailer(
    process.env['DOCSOC_SMTP_SERVER'] ?? 'smtp-mail.outlook.com',
    587,
    process.env['DOCSOC_SMTP_USERNAME'] ?? 'docsoc@ic.ac.uk',
    process.env['DOCSOC_SMTP_PASSWORD'] ?? 'password'
  );

  await mailer.sendMail(
    Mailer.makeFromEmail(
      process.env['DOCSOC_SENDER_NAME'] ?? 'DoCSoc',
      Mailer.validateEmail(process.env['DOCSOC_SENDER_EMAIL'])
        ? process.env['DOCSOC_SENDER_EMAIL'] ?? 'docsoc@ic.ac.uk'
        : 'docsoc@ic.ac.uk'
    ),
    [],
    'Test email',
    '<p>Test email</p>',
    'Test email'
  );
}

main();
