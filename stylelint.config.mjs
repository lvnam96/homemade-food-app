/** @type {import('stylelint').Config} */
const config = {
  extends: ['stylelint-config-standard' /* , 'stylelint-config-css-modules' */],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'value',
          'tailwind',
          'define-mixin',
          'mixin-content',
          'mixin',
          // 'include', 'content', 'if', 'else', 'each', 'for', // from `postcss-advanced-variables` but v4.0.0 has an error in dev mode
        ],
      },
    ],
    'function-no-unknown': null,
    // 'scss/function-no-unknown': null, // BUG: `stylelint-scss` reports CSS-specific functions like `var, gradial-gradient` as unknown

    // naming rules:
    'selector-class-pattern': [
      '^([a-zA-Z][-a-zA-Z0-9_]*)$', // supports both kebab-case and camelCase & still satisfies valid CSS selectors
      {
        message: (selector) =>
          `Expected class selector "${selector}" to be started with a lowercase letter then only letters, numbers and dashes.`,
      },
    ],
    'custom-media-pattern': null, // using scss to preprocess custom media queries (e.g: `@custom-media --#{$breakpoint} (...)`)
    'custom-property-pattern': null,
    'function-name-case': null,
    // 'scss/at-function-pattern': null,
    // 'scss/at-mixin-pattern': null,

    // code formatting rules:
    'at-rule-empty-line-before': [
      'always',
      {
        ignoreAtRules: ['if', 'else', 'each', 'for', 'while'], // does not need to ignore this rule to "inline" at-rules from SCSS because of `'blockless-after-same-name-blockless'` in `ignore` option below
        except: ['first-nested'],
        ignore: ['after-comment', 'first-nested', 'blockless-after-same-name-blockless'],
      },
    ],
    'comment-empty-line-before': [
      'always',
      {
        except: ['first-nested'], // must set to fit with prettier
        ignore: ['after-comment', 'stylelint-commands'],
      },
    ],
    // 'scss/double-slash-comment-empty-line-before': [
    //   'always',
    //   {
    //     ignore: ['between-comments', 'inside-block'],
    //   },
    // ],
    'declaration-empty-line-before': null,
    // 'scss/operator-no-newline-after': null,
  },
};

export default config;
