/* eslint-disable */
export default {
    displayName: "mailmerge-cli",
    preset: "../../jest.preset.js",
    testEnvironment: "node",
    transform: {
        "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
    },
    moduleFileExtensions: ["ts", "js", "html"],
    coverageDirectory: "../../coverage/email/mailmerge-cli",
    testMatch: ["<rootDir>/test/**/*.ts"],
};
