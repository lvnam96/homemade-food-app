/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  ignorePatterns: ['!**/.server', '!**/.client', '/public/**'],

  // Base config
  extends: [
    'eslint:recommended',
    'plugin:import/recommended', // required, it checks invalid imports
    'plugin:promise/recommended',
    'prettier', // disable prettier-conflicting rules, let prettier handle formatting
  ],
  rules: {
    'import/no-self-import': 'error', // Forbid a module from importing itself
    'import/no-cycle': ['error', { maxDepth: '∞' }], // Forbid cyclical dependencies between modules
    'camelcase': 'off', // sometimes I just must use snake_case variable name (from backend)
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'no-unused-expressions': [
      'error',
      {
        enforceForJSX: true,
      },
    ],
  },

  overrides: [
    // React
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: ['react', 'jsx-a11y', 'react-hooks'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      rules: {
        'react/display-name': 'off', // really annoying rule if `forwardedRef`/`memo` are used
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
      settings: {
        'react': {
          version: 'detect',
        },
        'formComponents': ['Form'],
        'linkComponents': [
          { name: 'Link', linkAttribute: 'to' },
          { name: 'NavLink', linkAttribute: 'to' },
        ],
        'import/resolver': {
          typescript: {},
        },
      },
    },

    // Typescript
    {
      files: ['**/*.{ts,tsx}'],
      plugins: ['@typescript-eslint', 'import'],
      parser: '@typescript-eslint/parser',
      settings: {
        'import/internal-regex': '^~/',
        'import/resolver': {
          node: {
            extensions: ['.ts', '.tsx'],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/recommended', 'plugin:import/typescript'],
      rules: {
        'import/no-self-import': 'error', // Forbid a module from importing itself
        'import/no-cycle': ['error', { maxDepth: '∞' }], // Forbid cyclical dependencies between modules
        'camelcase': 'off', // sometimes I just must use snake_case variable name (from backend)
        '@typescript-eslint/no-explicit-any': 'off', // sometimes I just want to disable TS, so I use `any`
        '@typescript-eslint/ban-ts-ignore': 'off', // sometimes I just hate TS
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': [
          'error',
          {
            // see https://eslint.org/docs/rules/no-use-before-define
            functions: false,
            variables: false,
          },
        ],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowIIFEs: true,
            allowExpressions: true,
            allowFunctionsWithoutTypeParameters: true, // TODO remove later after finish converting project to TS
          },
        ], // enabled following this recommendation: https://stackoverflow.com/a/70001850/5805244
      },
    },

    // Node
    {
      files: ['.eslintrc.cjs', '*.config.js', '*.config.ts', '*.server.*'],
      env: {
        node: true,
      },
    },
  ],
};
