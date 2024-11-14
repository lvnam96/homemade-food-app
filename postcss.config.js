import postcssImport from 'postcss-import';
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes';
import postcssTailwindNesting from '@tailwindcss/nesting';
import postcssNesting from 'postcss-nesting';
import postcssTailwind from 'tailwindcss';
import postcssPresetEnv from 'postcss-preset-env';
import postcssMixins from 'postcss-mixins';
import postcssUtilities from 'postcss-utilities';
// import postcssAdvancedVariables from 'postcss-advanced-variables';
// import postcssGlobalData from '@csstools/postcss-global-data';
// import postcssCascadeLayers from 'postcss-cascade-layers';
// import postcssNormalize from 'postcss-normalize';
// import stylelint from 'stylelint';
// import stylelintConfig from './stylelint.config.mjs';
// import tailwindConfig from './tailwind.config.js';

export default {
  plugins: [
    postcssImport,
    // postcssAdvancedVariables, // v4.0.0 of this plugin throws an error in dev mode, if we must use it, try v3.0.1
    postcssMixins,
    postcssUtilities,
    postcssFlexbugsFixes,
    // postcssNormalize, // `modern-normalize` is injected in 'tailwindcss/base' already (ref: https://tailwindcss.com/docs/preflight)
    postcssTailwindNesting(postcssNesting),
    postcssTailwind, // config is auto injected from `./tailwind.config.js`, does not need to import to pass to plugin here
    // postcssGlobalData({
    //   files: ['./app/styles/_custom-properties.css'],
    // }),
    // postcssCascadeLayers, // this does not work as expected
    postcssPresetEnv({
      env: process.env.NODE_ENV,
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 2,
      features: {
        'custom-properties': false,
        'custom-media-queries': { preserve: true },
        'nesting-rules': false, // ref: https://tailwindcss.com/docs/using-with-preprocessors#nesting
      },
    }),
  ],
};
