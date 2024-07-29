const getTemplateFields = (template: string): Set<string> => {
    const regex = /{{\s*(?<field>[a-zA-Z0-9_]+)(\s*\|\s*([a-zA-Z0-9_]+))?\s*}}/g;
    const fields = new Set<string>();
    for (const match of template.matchAll(regex)) {
        if (match.groups && match.groups["field"]) {
            fields.add(match.groups["field"]);
        }
    }
    return fields;
};

export default getTemplateFields;
