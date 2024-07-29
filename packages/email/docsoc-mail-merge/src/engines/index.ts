/**
 * Contains the different templating engines mail merge supports
 * @module engines
 */

import { TemplateEngine } from "./types";
import nunjucksEngine from "./nunjucks";


export const ENGINES_MAP: Record<string, TemplateEngine> = {
    nunjucks: nunjucksEngine
}