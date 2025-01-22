import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "react", "next"],
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:next/recommended",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn"], // Customize rules as needed
      "react/react-in-jsx-scope": "off", // React is automatically in scope with Next.js
    },
  },
];
