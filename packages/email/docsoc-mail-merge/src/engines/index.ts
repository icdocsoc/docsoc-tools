/**
 * Contains the different templating engines mail merge supports
 * @module engines
 */
import nunjucksEngine from "./nunjucks";
import { TemplateEngine, TemplateEngineConstructor } from "./types";

export const ENGINES_MAP: Record<string, TemplateEngineConstructor> = {
    nunjucks: nunjucksEngine,
};
