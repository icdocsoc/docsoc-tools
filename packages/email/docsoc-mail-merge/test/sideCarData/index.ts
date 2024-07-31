// index.test.ts
import fs from "fs/promises";
import { join } from "path";

import { TEMPLATE_ENGINES } from "../../src/engines";
import { TemplatePreviews } from "../../src/engines/types";
import {
    getRecordPreviewPrefix,
    getRecordPreviewPrefixForIndividual,
    getRecordPreviewPrefixForMetadata,
    writeMetadata,
} from "../../src/sideCarData/index";
import { SidecardData } from "../../src/sideCarData/types";
import { stopIfCriticalFsError } from "../../src/util/files";
import { CliOptions, CSVRecord } from "../../src/util/types";

jest.mock("fs/promises");
jest.mock("../../src/util/logger", () => {
    const logger = {
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    };
    return () => logger;
});
jest.mock("../../src/util/files");

describe("Sidecar Data Functions", () => {
    const mockRecord: CSVRecord = { id: "1", name: "Test Record" };
    const mockFileNamer = (record: CSVRecord) => `file_${record["id"]}`;
    const mockTemplateEngine = "nunjucks" as TEMPLATE_ENGINES;
    const mockTemplateOptions: CliOptions["templateOptions"] = {};
    const mockPreviews: TemplatePreviews = [{ name: "preview1", content: "content1", metadata: { key: "value" } }];
    const mockPreviewsRoot = "/mock/previews/root";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getRecordPreviewPrefix should return correct prefix", () => {
        const result = getRecordPreviewPrefix(mockRecord, mockFileNamer);
        expect(result).toBe("file_1");
    });

    test("getRecordPreviewPrefixForIndividual should return correct prefix", () => {
        const result = getRecordPreviewPrefixForIndividual(
            mockRecord,
            mockFileNamer,
            mockTemplateEngine,
            mockPreviews[0],
        );
        expect(result).toBe(`file_1__${mockTemplateEngine}__preview1`);
    });

    test("getRecordPreviewPrefixForMetadata should return correct metadata filename", () => {
        const result = getRecordPreviewPrefixForMetadata(mockRecord, mockFileNamer);
        expect(result).toBe("file_1-metadata.json");
    });

    test("writeMetadata should write metadata to a JSON file", async () => {
        const mockSidecar: SidecardData = {
            record: mockRecord,
            engine: mockTemplateEngine,
            engineOptions: mockTemplateOptions,
            files: [
                {
                    filename: `file_1__${mockTemplateEngine}__preview1`,
                    engineData: {
                        name: "preview1",
                        content: undefined,
                        metadata: { key: "value" },
                    },
                },
            ],
        };

        (stopIfCriticalFsError as jest.Mock).mockImplementation((promise) => promise);

        await writeMetadata(
            mockRecord,
            mockTemplateEngine,
            mockTemplateOptions,
            mockPreviews,
            mockFileNamer,
            mockPreviewsRoot,
        );

        expect(fs.writeFile).toHaveBeenCalledWith(
            join(mockPreviewsRoot, "file_1-metadata.json"),
            JSON.stringify(mockSidecar, null, 4),
        );
    });
});
