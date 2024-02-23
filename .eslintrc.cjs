module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "standard-with-typescript",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    "rules": {
        "semi": ["error", "always"], // Enforce semicolons
        "max-len": ["error", { "code": 120 }], // Enforce a maximum line length of 120 characters
        "@typescript-eslint/semi": ["error", "always"], // Override the semi rule for TypeScript files
        "no-extra-semi": "off", // Turn off the rule that disallows unnecessary semicolons
        "@typescript-eslint/no-extra-semi": "off" // Turn off the rule for TypeScript files
    }
};
