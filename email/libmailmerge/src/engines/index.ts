/**
 * Contains the different templating engines mail merge supports
 * @module engines
 */
import nunjucksEngine from "./nunjucks-md";
import { TemplateEngineConstructor } from "./types";

export type TEMPLATE_ENGINES = "nunjucks";

/** Map of engine names (provided on the CLI) to constructors for those engines */
export const ENGINES_MAP: Record<TEMPLATE_ENGINES, TemplateEngineConstructor> = {
    nunjucks: nunjucksEngine,
};