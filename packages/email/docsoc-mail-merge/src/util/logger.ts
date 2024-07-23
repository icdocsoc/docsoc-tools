
import chalk from "chalk";
import winston from "winston";

const { combine, colorize, printf, timestamp } = winston.format;

export default function createLogger(moduleName: string) {
	const options: winston.LoggerOptions = {
		transports: [
			new winston.transports.Console({
				format: combine(
					colorize(),
					timestamp(),
					printf((info) => {
						return `${chalk.grey(info["timestamp"])} ${chalk.magenta(moduleName)} ${info.level} ${info.message}`;
					}),
				),
				level: "debug",
			}),
		],
	};

	return winston.createLogger(options);
}