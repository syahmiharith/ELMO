module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    "/lib/**/*",
    "/generated/**/*",
    "**/*.js",
  ],
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    // DISABLE ALL PROBLEMATIC RULES FOR WINDOWS DEVELOPMENT
    "linebreak-style": "off",
    "eol-last": "off", 
    "quotes": "off",
    "indent": "off",
    "max-len": "off",
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "object-curly-spacing": "off",
    "operator-linebreak": "off",
    "new-cap": "off",
    "camelcase": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off", 
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "import/no-unresolved": "off",
    // Only keep essential error checking
    "@typescript-eslint/no-unused-expressions": "warn",
    "no-console": "warn",
  },
};
