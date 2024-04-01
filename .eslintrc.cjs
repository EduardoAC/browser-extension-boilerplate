module.exports = {
    root: true,
    env: { browser: true, es2020: true, jest: true },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
    ],
    ignorePatterns: ["dist", ".eslintrc.cjs"],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    parser: "@typescript-eslint/parser",
    plugins: ["react-refresh", "react", "react-hooks", "jsx-a11y", "prettier"],
    rules: {
        "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
        ],
        "react/react-in-jsx-scope": "off",
        "react/jsx-uses-react": "off",
        "prettier/prettier": "error",
        semi: ["error", "never"],
    },
}
