export interface NunjucksTemplateOptions {
	templatePath: string;
	rootHtmlTemplate: string;
	[key: string]: string;
}

export function assertIsNunjucksTemplateOptions(
	options: Record<string, string | number | boolean>,
): asserts options is NunjucksTemplateOptions {
	if (!options["templatePath"] || typeof options["templatePath"] !== "string") {
			throw new Error("Invalid template option");
	}
	if (!options["rootHtmlTemplate"] || typeof options["rootHtmlTemplate"] !== "string") {
			throw new Error("Invalid rootHtmlTemplate option");
	}
}