const js = require('@eslint/js');

module.exports = [
    {
        files: ['**/*.js'],
        ignores: ['node_modules/**'],
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs'
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'warn'
        }
    }
]