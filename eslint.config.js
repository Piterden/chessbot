const { defineConfig } = require('eslint/config')
const globals = require('globals')
const babelParser = require('@babel/eslint-parser')
const js = require('@eslint/js')

module.exports = defineConfig([
  {
    files: ['**/*.js'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: { ...globals.node },
      parser: babelParser,
      ecmaVersion: 2018,
      // sourceType: 'module',
      parserOptions: {
        requireConfigFile: false,
        ecmaFeatures: {
          globalReturn: false,
          modules: false,
        },
      },
    },

    rules: {
      'max-len': 'off',
      'prefer-rest-params': 'off',
      'prefer-destructuring': 'off',
      'unicorn/prefer-spread': 'off',
      'function-paren-newline': 'off',
      curly: 'off',

      'comma-dangle': ['error', {
        functions: 'only-multiline',
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
      }],

      'id-length': ['error', {
        min: 2,
        exceptions: ['i', 'x', 'y', 'e'],
      }],

      'id-match': ['error', '^(([A-Za-z0-9]+){2,})|([A-Z][A-Z_0-9]+)$', {
        properties: false,
        onlyDeclarations: true,
      }],

      indent: ['error', 2, {
        SwitchCase: 1,
      }],

      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      camelcase: ['off'],
    },
  },
])
