import fs from "fs/promises";
import { join, basename } from "path";

export const move = (file: string, directory: string) => {
    return fs.rename(file, join(directory, basename(file)));
};
