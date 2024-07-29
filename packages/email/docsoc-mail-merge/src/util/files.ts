import createLogger from "./logger";

const logger = createLogger("docsoc.utils");

function isErrnoException(e: any): e is NodeJS.ErrnoException {
    return e.code !== undefined;
}

/**
 * Handles error thrown by fs.promises functions & will stop the program
 * @param promise Promise returned by a fs.promises function
 * @example await handleCriticalFsError(fs.readFile("file.txt", "utf-8"));
 */
export async function stopIfCriticalFsError<T>(promise: Promise<T>) {
    try {
        return await promise;
    } catch (e) {
        if (e instanceof Error && isErrnoException(e)) {
            if (e?.code === "ENOENT") {
                logger.error("File not found: ", e.message);
            } else if (e?.code === "EACCES") {
                logger.error("Permission denied: ", e.message);
            } else {
                logger.error("Critical error occurred while reading file: ", e.message);
            }
        } else {
            logger.error("Critical error occurred while reading file: ", e);
        }
        process.exit(1);
    }
}