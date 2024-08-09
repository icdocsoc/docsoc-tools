/* eslint-disable */
export default {
    displayName: "eactivities",
    preset: "../../jest.preset.js",
    testEnvironment: "node",
    transform: {
        "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
        "^(.*).js$": ["babel-jest"],
    },
    transformIgnorePatterns: ["/node_modules/(?!(@docsoc|chalk)/)", "\\.pnp\\.[^\\/]+$"],
    moduleFileExtensions: ["ts", "js", "html"],
    coverageDirectory: "../../coverage/common/eactivities",
};
