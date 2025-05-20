module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:@next/next/recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:storybook/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: [
    'import',
    '@typescript-eslint',
    'react',
    'simple-import-sort',
    'prettier',
  ],
  root: true,
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-shadow': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-use-before-define': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'consistent-return': 'warn',
    'import/extensions': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react/require-default-props': 'off',
    'react/no-array-index-key': 'warn',
    'react/jsx-boolean-value': 'off',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        pathGroups: [
          {
            group: 'external',
            pattern: '@/**',
            position: 'after',
          },
        ],
      },
    ],
    'import/prefer-default-export': 'off',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        aspects: ['invalidHref', 'preferButton'],
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
      },
    ],
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': 'off',
    'no-console': 'warn',
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'warn',
    'react/jsx-filename-extension': [1, { extensions: ['.ts', '.tsx'] }],
    'react/jsx-props-no-spreading': ['off', { custom: 'ignore' }],
    'react/no-unescaped-entities': 'off',
    'react/prop-types': 'off',
    'react/jsx-no-bind': 'off',
    'react/react-in-jsx-scope': 'off',
    // 'simple-import-sort/exports': 'error',
    // 'simple-import-sort/imports': 'error',
    'sort-keys': 'off',
    'no-unused-vars': 'warn',
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/**',
            from: './public/**',
            message:
              'Do not import from public into src. Place shared assets in src/shared/assets or a similar location within src.',
          },
          {
            target: './src/**',
            from: './src/app/**',
            message:
              'Routes or Pages can not be imported. Place components into respective module or src/shared folder.',
          },
        ],
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.svg'],
            message:
              'Direct import of image files is not allowed. Use the Image component from "@/shared/ui/components/Image/Image" instead.',
          },
        ],
        paths: [
          {
            name: 'next/link',
            message:
              "Please use 'RouteLink' from '@/shared/ui/components/RouteLink/RouteLink' instead.",
          },
          {
            name: 'next/navigation',
            importNames: ['useRouter'],
            message:
              "Please use 'useAppRouter' from '@/shared/ui/hooks/useAppRouter' instead.",
          },
          {
            name: 'next/router',
            importNames: ['useRouter'],
            message:
              "Please use 'useAppRouter' from '@/shared/ui/hooks/useAppRouter' instead.",
          },
          {
            name: 'next/image',
            message:
              "Please use 'Image' from '@/shared/ui/components/Image/Image' instead.",
          },
        ],
      },
    ],

    'react/function-component-definition': [
      2,
      {
        namedComponents: ['arrow-function', 'function-declaration'],
        unnamedComponents: 'arrow-function',
      },
    ],
  },
  overrides: [
    {
      files: ['*.tsx'],
      rules: {
        'max-lines': [
          'error',
          {
            max: 300,
            skipBlankLines: false,
            skipComments: false,
          },
        ],
      },
    },
  ],
  settings: {
    // TypeScript needs this to resolve Next.js absolute imports
    'import/resolver': {
      typescript: {
        project: '.',
      },
      node: {
        paths: ['./src'],
        moduleDirectory: ['node_modules', './'],
      },
    },
    react: {
      version: 'detect',
    },
  },
};
