import { ENGINES_MAP } from "../engines";
import { TemplateEngineOptions, TemplatePreview } from "../engines/types";
import { CSVRecord, EmailString } from "../util/types";

/**
 * Outputted to JSON files next to rendered template previews, containing metadata about the preview.
 */
export interface SidecarData {
    /** Name of the template rendered (used for logging) */
    name: string;
    /** Record associated with the template rendered  */
    record: CSVRecord;
    /** Engine used */
    engine: keyof typeof ENGINES_MAP;
    /** Options given to the engine */
    engineOptions: TemplateEngineOptions;
    /** Data about the files rendered */
    files: Array<{
        filename: string;
        /** Data returned from {@link TemplateEngine.renderPreview} */
        engineData: Omit<TemplatePreview, "content"> & {
            content: never | undefined;
        };
    }>;
    /** Metadata for emailing */
    email: {
        to: EmailString;
        subject: string;
    };
}
