import createLogger from "./util/logger";

const logger = createLogger("docsoc");

async function main() {
	logger.info('Hello, world!');
}

main();