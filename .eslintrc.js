module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: ["plugin:vue/essential", "eslint:recommended", "@vue/typescript/recommended"],
    parserOptions: {
        parser: "@typescript-eslint/parser",
        ecmaVersion: 2021,
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "@typescript-eslint/no-non-null-assertion": "off",
    },
    ignorePatterns : [
        "src/lib/doodleclient/wasmclient/buffer/*",
        "src/lib/doodleclient/wasmclient/core*/*",
        "src/lib/doodleclient/wasmclient/crypto/*"
    ]
};
