module.exports = {
    parserOptions: {
        project: './tsconfig.json',
        createDefaultProgram: true,
    },
    extends: [
        './../../.eslintrc.js',
        'eslint:recommended',
        'airbnb-base',
        'airbnb-typescript/base',
        'prettier',
        'plugin:json/recommended',
    ],
    plugins: ['@typescript-eslint'],
    rules: {
        'no-case-declarations': 'off',
        'no-template-curly-in-string': 'off',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_' },
        ],
    },
};
