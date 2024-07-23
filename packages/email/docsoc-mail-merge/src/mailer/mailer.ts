import nodemailer from 'nodemailer';
import { EmailString, FromEmail } from '../util/types';

export default class Mailer {
	constructor(
		private host: string,
		private port: number,
		private username: string,
		private password: string,
	) {}

	private transporter = nodemailer.createTransport({
		host: this.host,
		port: this.port,
		secure: false, // Use `true` for port 465, `false` for all other ports
		auth: {
			user: this.username,
			pass: this.password,
		},
	});

	async sendMail(
		from: FromEmail,
		to: string[],
		subject: string,
		html: string,
		text: string,
	): Promise<void> {
		const info = await this.transporter.sendMail({
			from, // sender address
			to, // list of receivers
			subject, // Subject line
			text: text, // plain text body
			html: html, // html body
		});

		console.log(`Message sent: ${info.messageId}`);
	}

	static validateEmail(email?: string): email is EmailString {
		if (!email) return false;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
	
	static makeFromEmail(name: string, email: EmailString): FromEmail {
		return `"${name}" <${email}>`;
	}
}