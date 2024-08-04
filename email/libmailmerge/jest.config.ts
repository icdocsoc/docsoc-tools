/* eslint-disable */
export default {
    displayName: "mailmerge-cli",
    preset: "../../jest.preset.js",
    testEnvironment: "node",
    transform: {
        "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
        "^(.*).js$": ["babel-jest"],
    },
    transformIgnorePatterns: ["/node_modules/(?!(@docsoc)/)", "\\.pnp\\.[^\\/]+$"],
    moduleFileExtensions: ["ts", "js", "html"],
    coverageDirectory: "../../coverage/email/mailmerge-cli",
    testMatch: ["<rootDir>/test/**/*.ts"],
};
